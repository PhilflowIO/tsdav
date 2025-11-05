/**
 * Calendar Collection Migrator
 * Implements CalDAV migration for calendars with VEVENT and VTODO support
 */

import { DAVCalendar, DAVCalendarObject, DAVNamespaceShort } from 'tsdav';
import chalk from 'chalk';
import { CollectionMigrator, DAVCollection, DAVObject } from './CollectionMigrator';
import { UIDExtractor } from '../utils/uidExtractor';
import { ObjectType } from '../types/config';
import * as readline from 'readline';

/**
 * CalDAV-specific migrator for calendars (events + tasks)
 */
export class CalendarCollectionMigrator extends CollectionMigrator {
  /**
   * Fetch all calendars from source
   */
  async fetchSourceCollections(): Promise<DAVCollection[]> {
    const calendars = await this.sourceClient.fetchCalendars();
    return calendars as DAVCollection[];
  }

  /**
   * Fetch all calendars from target
   */
  async fetchTargetCollections(): Promise<DAVCollection[]> {
    const calendars = await this.targetClient.fetchCalendars();
    return calendars as DAVCollection[];
  }

  /**
   * Fetch all calendar objects from a calendar (events and tasks)
   * @param collection - Calendar to fetch from
   * @param options - Additional options (e.g., timeRange)
   */
  async fetchObjectsFromCollection(
    collection: DAVCollection,
    options?: any
  ): Promise<DAVObject[]> {
    const calendar = collection as DAVCalendar;
    const fetchOptions: any = { calendar };

    if (options?.timeRange) {
      fetchOptions.timeRange = options.timeRange;
    }

    const objects = await this.sourceClient.fetchCalendarObjects(fetchOptions);
    return objects.map(obj => ({
      url: obj.url,
      data: obj.data,
      etag: obj.etag,
    })) as DAVObject[];
  }

  /**
   * Create calendar object on target
   */
  async createObjectOnTarget(
    collection: DAVCollection,
    object: DAVObject,
    uid: string
  ): Promise<Response> {
    const calendar = collection as DAVCalendar;

    // Generate safe filename from UID
    const filename = `${UIDExtractor.generateFilename(uid)}.ics`;

    return await this.targetClient.createCalendarObject({
      calendar,
      filename,
      iCalString: object.data,
    });
  }

  /**
   * Create a new calendar on target
   */
  async createCollection(displayName: string): Promise<DAVCollection> {
    const calendarName = displayName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() ||
      `calendar-${Date.now()}`;
    const homeUrl = this.targetClient.account?.homeUrl?.replace(/\/+$/, '') || '';
    const newCalendarUrl = `${homeUrl}/${calendarName}/`;

    await this.targetClient.makeCalendar({
      url: newCalendarUrl,
      props: {
        displayname: displayName,
        [`${DAVNamespaceShort.CALDAV}:calendar-description`]: `Migrated from ${this.config.source.provider}`,
      },
    });

    // Fetch calendars again to get the newly created one
    await this.targetRateLimiter.throttle();
    const updatedCalendars = await this.targetClient.fetchCalendars();
    const newCalendar = updatedCalendars.find((cal) => cal.url === newCalendarUrl);

    if (!newCalendar) {
      throw new Error(`Failed to create calendar: ${displayName}`);
    }

    return newCalendar as DAVCollection;
  }

  /**
   * Extract UID from iCalendar data
   */
  extractUID(objectData: string): string | null {
    return UIDExtractor.extractUID(objectData);
  }

  /**
   * Extract UID from iCalendar data (throws if not found)
   */
  extractUIDOrThrow(objectData: string): string {
    return UIDExtractor.extractUIDOrThrow(objectData);
  }

  /**
   * Get collection type name for logging
   */
  getCollectionTypeName(): string {
    return 'calendar';
  }

  /**
   * Get object type name for logging
   */
  getObjectTypeName(): string {
    return 'event/task';
  }

  /**
   * Analyze calendar objects to detect VEVENT and VTODO counts
   * @param objects - Calendar objects to analyze
   * @returns Object counts by type
   */
  analyzeObjectTypes(objects: DAVObject[]): { events: number; tasks: number } {
    let events = 0;
    let tasks = 0;

    for (const obj of objects) {
      const type = UIDExtractor.detectObjectType(obj.data);
      if (type === 'VEVENT') events++;
      else if (type === 'VTODO') tasks++;
    }

    return { events, tasks };
  }

  /**
   * Prompt user whether to migrate tasks
   * @param calendarName - Calendar display name
   * @param taskCount - Number of tasks found
   * @returns Promise<boolean> - true if user wants to migrate tasks
   */
  async promptMigrateTasks(calendarName: string, taskCount: number): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        chalk.yellow(
          `\n  Found ${taskCount} task(s) in calendar "${calendarName}". Migrate tasks? (y/n): `
        ),
        (answer) => {
          rl.close();
          const response = answer.trim().toLowerCase() === 'y';
          console.log(
            response
              ? chalk.green('  ✓ Will migrate tasks')
              : chalk.yellow('  ⊘ Will skip tasks')
          );
          resolve(response);
        }
      );
    });
  }

  /**
   * Filter calendar objects based on user preferences (e.g., exclude tasks)
   * @param objects - All calendar objects
   * @param includeTasks - Whether to include VTODO objects
   * @returns Filtered objects
   */
  filterCalendarObjects(objects: DAVObject[], includeTasks: boolean): DAVObject[] {
    if (includeTasks) {
      return objects; // Include all objects
    }

    // Filter out VTODO objects
    return objects.filter((obj) => {
      const type = UIDExtractor.detectObjectType(obj.data);
      return type !== 'VTODO';
    });
  }

  /**
   * Migrate a single calendar with interactive task handling
   * Override base method to add task detection and prompting
   */
  async migrateCollection(sourceCollection: DAVCollection): Promise<void> {
    const collectionName = this.getDisplayName(sourceCollection);

    // Fetch all objects from source
    console.log(`  Fetching events and tasks from source calendar...`);
    await this.sourceRateLimiter.throttle();

    const fetchOptions: any = {};
    if (this.config.options?.timeRange) {
      fetchOptions.timeRange = this.config.options.timeRange;
    }

    let allObjects = await this.fetchObjectsFromCollection(sourceCollection, fetchOptions);

    // Analyze object types (VEVENT vs VTODO)
    const { events, tasks } = this.analyzeObjectTypes(allObjects);
    console.log(chalk.green(`  ✓ Found ${events} event(s) and ${tasks} task(s)`));

    if (allObjects.length === 0) {
      console.log(chalk.yellow(`  No objects to migrate`));
      return;
    }

    // Prompt user if tasks are found (unless in dry-run mode)
    let includeTasks = true;
    if (tasks > 0 && !this.config.options?.dryRun) {
      includeTasks = await this.promptMigrateTasks(collectionName, tasks);
    }

    // Filter objects based on user preference
    const objectsToMigrate = this.filterCalendarObjects(allObjects, includeTasks);
    console.log(
      chalk.blue(`  Will migrate ${objectsToMigrate.length} object(s) total`)
    );

    // Get or create target calendar
    const targetCollection = await this.getOrCreateTargetCollection(sourceCollection);
    console.log(chalk.green(`  ✓ Target calendar: ${this.getDisplayName(targetCollection)}`));

    // Fetch existing objects from target (for duplicate detection)
    console.log(`  Fetching existing objects from target calendar...`);
    await this.targetRateLimiter.throttle();
    const targetObjects = await this.fetchObjectsFromCollection(targetCollection);

    // Build set of existing UIDs on target
    const existingUIDs = new Set<string>();
    for (const obj of targetObjects) {
      try {
        const uid = this.extractUID(obj.data);
        if (uid) existingUIDs.add(uid);
      } catch (error) {
        console.warn(`  Warning: Failed to extract UID from target object: ${error}`);
      }
    }
    console.log(chalk.green(`  ✓ Found ${existingUIDs.size} existing objects on target`));

    // Add collection to state
    const sourceDisplayName = this.getDisplayName(sourceCollection);
    const targetDisplayName = this.getDisplayName(targetCollection);

    const collectionId = this.stateManager.addCalendar(
      sourceCollection.url,
      sourceDisplayName,
      targetCollection.url,
      targetDisplayName,
      objectsToMigrate.length
    );

    // Store user response for tasks
    this.stateManager.storeUserResponse(collectionId, 'migrateTasks', includeTasks);

    // Initialize object counts
    this.stateManager.initializeObjectCounts(collectionId);

    this.stateManager.startCalendar(collectionId);

    // Dry-run mode: just show what would be migrated
    if (this.config.options?.dryRun) {
      this.previewMigration(objectsToMigrate, existingUIDs, collectionId);
      return;
    }

    // Migrate objects with progress bar
    await this.migrateObjects(objectsToMigrate, targetCollection, existingUIDs, collectionId);

    // Track object type counts in state
    for (const obj of objectsToMigrate) {
      const type = UIDExtractor.detectObjectType(obj.data);
      if (type) {
        this.stateManager.incrementObjectCount(collectionId, type);
      }
    }

    this.stateManager.completeCalendar(collectionId);
  }
}
