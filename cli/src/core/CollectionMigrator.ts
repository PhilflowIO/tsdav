/**
 * Abstract Collection Migrator
 * Unified base class for CalDAV and CardDAV migration logic
 * Handles duplicate detection, rate limiting, progress tracking, error recovery
 */

import { DAVClient } from 'tsdav';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { StateManager } from './StateManager';
import { RateLimiter } from './RateLimiter';
import { MigrationConfig } from '../types/config';

/**
 * Generic collection interface (Calendar or AddressBook)
 */
export interface DAVCollection {
  url: string;
  displayName?: string | object | any;
  [key: string]: any;
}

/**
 * Generic DAV object interface (Calendar Object or vCard)
 */
export interface DAVObject {
  url?: string;
  data: string; // iCalendar or vCard format
  etag?: string;
  [key: string]: any;
}

/**
 * Options for migrating objects
 */
export interface MigrateObjectsOptions {
  overwrite?: boolean;
  dryRun?: boolean;
}

/**
 * Abstract base class for collection migration (CalDAV/CardDAV)
 */
export abstract class CollectionMigrator {
  protected config: MigrationConfig;
  protected stateManager: StateManager;
  protected sourceClient: DAVClient;
  protected targetClient: DAVClient;
  protected sourceRateLimiter: RateLimiter;
  protected targetRateLimiter: RateLimiter;

  constructor(
    config: MigrationConfig,
    stateManager: StateManager,
    sourceClient: DAVClient,
    targetClient: DAVClient,
    sourceRateLimiter: RateLimiter,
    targetRateLimiter: RateLimiter
  ) {
    this.config = config;
    this.stateManager = stateManager;
    this.sourceClient = sourceClient;
    this.targetClient = targetClient;
    this.sourceRateLimiter = sourceRateLimiter;
    this.targetRateLimiter = targetRateLimiter;
  }

  /**
   * Fetch all collections from source (calendars or addressbooks)
   * @returns Array of collections
   */
  abstract fetchSourceCollections(): Promise<DAVCollection[]>;

  /**
   * Fetch all collections from target (calendars or addressbooks)
   * @returns Array of collections
   */
  abstract fetchTargetCollections(): Promise<DAVCollection[]>;

  /**
   * Fetch all objects from a collection (events/tasks or contacts)
   * @param collection - Collection to fetch from
   * @param options - Additional options (e.g., timeRange for calendars)
   * @returns Array of DAV objects
   */
  abstract fetchObjectsFromCollection(
    collection: DAVCollection,
    options?: any
  ): Promise<DAVObject[]>;

  /**
   * Create an object on target collection
   * @param collection - Target collection
   * @param object - Object to create
   * @param uid - UID of the object
   * @returns HTTP response
   */
  abstract createObjectOnTarget(
    collection: DAVCollection,
    object: DAVObject,
    uid: string
  ): Promise<Response>;

  /**
   * Create a new collection on target
   * @param displayName - Display name for the collection
   * @returns Created collection
   */
  abstract createCollection(displayName: string): Promise<DAVCollection>;

  /**
   * Extract UID from object data (iCalendar or vCard)
   * @param objectData - Raw object data string
   * @returns UID string or null
   */
  abstract extractUID(objectData: string): string | null;

  /**
   * Extract UID from object data (throws if not found)
   * @param objectData - Raw object data string
   * @returns UID string
   * @throws Error if UID cannot be extracted
   */
  abstract extractUIDOrThrow(objectData: string): string;

  /**
   * Get collection type name for logging (e.g., "calendar", "addressbook")
   */
  abstract getCollectionTypeName(): string;

  /**
   * Get object type name for logging (e.g., "event", "contact")
   */
  abstract getObjectTypeName(): string;

  /**
   * Helper: Extract displayName as string (handle objects from Baïkal/XML parsing)
   */
  protected getDisplayName(collection: DAVCollection, fallback: string = 'Unnamed'): string {
    // Try string displayName first
    if (typeof collection.displayName === 'string' && collection.displayName.trim()) {
      return collection.displayName.trim();
    }

    // Handle complex objects (e.g., from Baïkal XML parsing)
    if (collection.displayName && typeof collection.displayName === 'object') {
      const obj = collection.displayName as any;
      if (obj._text && String(obj._text).trim()) return String(obj._text).trim();
      if (obj.value && String(obj.value).trim()) return String(obj.value).trim();
      if (obj.toString && obj.toString() !== '[object Object]') {
        const strVal = obj.toString().trim();
        if (strVal) return strVal;
      }
    }

    // Fallback: Extract name from URL
    if (collection.url) {
      try {
        const urlPath = collection.url.replace(/\/$/, ''); // Remove trailing slash
        const pathSegments = urlPath.split('/').filter(s => s.length > 0);

        // Get last meaningful segment
        for (let i = pathSegments.length - 1; i >= 0; i--) {
          const segment = pathSegments[i];
          // Skip technical segments
          if (!segment.includes('.php') && segment !== 'calendars' && segment !== 'addressbooks') {
            const humanized = decodeURIComponent(segment)
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());
            return humanized;
          }
        }
      } catch (e) {
        // URL parsing failed, continue to fallback
      }
    }

    return fallback;
  }

  /**
   * Migrate a single collection
   * @param sourceCollection - Source collection to migrate
   */
  async migrateCollection(sourceCollection: DAVCollection): Promise<void> {
    const collectionName = this.getDisplayName(sourceCollection);
    const collectionType = this.getCollectionTypeName();
    const objectType = this.getObjectTypeName();

    // Fetch all objects from source
    console.log(`  Fetching ${objectType}s from source ${collectionType}...`);
    await this.sourceRateLimiter.throttle();

    const fetchOptions: any = {};
    if (this.config.options?.timeRange) {
      fetchOptions.timeRange = this.config.options.timeRange;
    }

    let sourceObjects = await this.fetchObjectsFromCollection(sourceCollection, fetchOptions);
    console.log(chalk.green(`  ✓ Found ${sourceObjects.length} ${objectType}s`));

    if (sourceObjects.length === 0) {
      console.log(chalk.yellow(`  No ${objectType}s to migrate`));
      return;
    }

    // Get or create target collection
    const targetCollection = await this.getOrCreateTargetCollection(sourceCollection);
    console.log(chalk.green(`  ✓ Target ${collectionType}: ${this.getDisplayName(targetCollection)}`));

    // Fetch existing objects from target (for duplicate detection)
    console.log(`  Fetching existing ${objectType}s from target ${collectionType}...`);
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
    console.log(chalk.green(`  ✓ Found ${existingUIDs.size} existing ${objectType}s on target`));

    // Add collection to state
    const sourceDisplayName = this.getDisplayName(sourceCollection);
    const targetDisplayName = this.getDisplayName(targetCollection);

    const collectionId = this.stateManager.addCalendar(
      sourceCollection.url,
      sourceDisplayName,
      targetCollection.url,
      targetDisplayName,
      sourceObjects.length
    );
    this.stateManager.startCalendar(collectionId);

    // Dry-run mode: just show what would be migrated
    if (this.config.options?.dryRun) {
      this.previewMigration(sourceObjects, existingUIDs, collectionId);
      return;
    }

    // Migrate objects with progress bar
    await this.migrateObjects(sourceObjects, targetCollection, existingUIDs, collectionId);

    this.stateManager.completeCalendar(collectionId);
  }

  /**
   * Migrate objects from source to target
   */
  protected async migrateObjects(
    sourceObjects: DAVObject[],
    targetCollection: DAVCollection,
    existingUIDs: Set<string>,
    collectionId: number
  ): Promise<void> {
    const objectType = this.getObjectTypeName();

    // Create progress bar
    const progressBar = new cliProgress.SingleBar(
      {
        format:
          '  Progress |' +
          chalk.cyan('{bar}') +
          '| {percentage}% | {value}/{total} ' + objectType + 's | Migrated: {migrated} | Skipped: {skipped} | Failed: {failed}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );

    progressBar.start(sourceObjects.length, 0, {
      migrated: 0,
      skipped: 0,
      failed: 0,
    });

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const sourceObject of sourceObjects) {
      try {
        // Extract UID
        const uid = this.extractUIDOrThrow(sourceObject.data);

        // Check if already migrated in previous run (resume capability)
        if (this.stateManager.isMigrated(collectionId, uid)) {
          skipped++;
          progressBar.update({ migrated, skipped, failed });
          continue;
        }

        // Check if UID exists on target
        if (existingUIDs.has(uid) && !this.config.options?.overwrite) {
          this.stateManager.logSkipped(collectionId, uid);
          skipped++;
          progressBar.update({ migrated, skipped, failed });
          continue;
        }

        // Migrate object
        await this.targetRateLimiter.executeWithRetry(async () => {
          const response = await this.createObjectOnTarget(targetCollection, sourceObject, uid);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        });

        this.stateManager.logSuccess(collectionId, uid);
        migrated++;
        progressBar.increment({ migrated, skipped, failed });
      } catch (error) {
        const uid = this.extractUID(sourceObject.data) || 'unknown';
        const errorMsg = (error as Error).message;
        this.stateManager.logFailure(collectionId, uid, errorMsg);
        failed++;
        progressBar.update({ migrated, skipped, failed });
      }
    }

    progressBar.stop();
    console.log(
      chalk.green(
        `  ✓ Completed: ${migrated} migrated, ${skipped} skipped, ${failed} failed`
      )
    );
  }

  /**
   * Preview mode: show what would be migrated (dry-run)
   */
  protected previewMigration(
    sourceObjects: DAVObject[],
    existingUIDs: Set<string>,
    collectionId: number
  ): void {
    let wouldMigrate = 0;
    let wouldSkip = 0;
    let errors = 0;

    for (const sourceObject of sourceObjects) {
      try {
        const uid = this.extractUID(sourceObject.data);
        if (!uid) {
          errors++;
          continue;
        }

        // Check if already migrated in previous run
        if (this.stateManager.isMigrated(collectionId, uid)) {
          wouldSkip++;
          continue;
        }

        // Check if exists on target
        if (existingUIDs.has(uid) && !this.config.options?.overwrite) {
          wouldSkip++;
        } else {
          wouldMigrate++;
        }
      } catch (error) {
        errors++;
      }
    }

    const objectType = this.getObjectTypeName();
    console.log(chalk.cyan('  Preview (dry-run):'));
    console.log(chalk.green(`    Would migrate: ${wouldMigrate} ${objectType}s`));
    console.log(chalk.yellow(`    Would skip: ${wouldSkip} ${objectType}s (already exist)`));
    if (errors > 0) {
      console.log(chalk.red(`    Errors: ${errors} ${objectType}s (failed to parse UID)`));
    }
  }

  /**
   * Get or create target collection (match by display name)
   */
  protected async getOrCreateTargetCollection(
    sourceCollection: DAVCollection
  ): Promise<DAVCollection> {
    // Fetch existing collections on target
    await this.targetRateLimiter.throttle();
    const targetCollections = await this.fetchTargetCollections();

    // Try to find existing collection with same display name
    const sourceDisplayName = this.getDisplayName(sourceCollection);
    const existingCollection = targetCollections.find(
      (col) => this.getDisplayName(col) === sourceDisplayName
    );

    if (existingCollection) {
      return existingCollection;
    }

    // Check if target is Google (which doesn't support collection creation via DAV)
    const collectionType = this.getCollectionTypeName();
    if (this.config.target.provider === 'google') {
      throw new Error(
        `${collectionType} "${sourceDisplayName}" not found on Google.\n\n` +
        `Google DAV API does not support creating ${collectionType}s.\n` +
        `Please create the ${collectionType} manually on Google first and re-run the migration.\n\n` +
        `Alternative: Use ${collectionType} mapping in config to migrate to an existing ${collectionType}.`
      );
    }

    // Create new collection on target (non-Google providers)
    console.log(`  Creating new ${collectionType} on target: ${sourceDisplayName}`);
    await this.targetRateLimiter.throttle();

    return await this.createCollection(sourceDisplayName);
  }

  /**
   * Filter collections based on config
   */
  protected filterCollections(collections: DAVCollection[]): DAVCollection[] {
    if (!this.config.options?.calendarFilter) {
      return collections;
    }

    const collectionType = this.getCollectionTypeName();
    try {
      const regex = new RegExp(this.config.options.calendarFilter);
      const filtered = collections.filter((col) => {
        const displayName = this.getDisplayName(col, '');
        return regex.test(displayName);
      });
      console.log(
        chalk.yellow(
          `Filtered ${collections.length} → ${filtered.length} ${collectionType}s (pattern: ${this.config.options.calendarFilter})`
        )
      );
      return filtered;
    } catch (error) {
      console.warn(
        chalk.yellow(`Invalid filter regex: ${this.config.options.calendarFilter}`)
      );
      return collections;
    }
  }
}
