/**
 * Migration Engine
 * Main orchestrator for CalDAV calendar migration
 * Handles source/target coordination, duplicate detection, error recovery
 */

import { DAVClient, DAVCalendar, DAVCalendarObject } from 'tsdav';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { MigrationConfig } from '../types/config';
import { StateManager } from './StateManager';
import { ProviderFactory } from './ProviderFactory';
import { RateLimiter, ProviderRateLimits } from './RateLimiter';
import { UIDExtractor } from '../utils/uidExtractor';

export class MigrationEngine {
  private config: MigrationConfig;
  private stateManager: StateManager;
  private sourceClient: DAVClient | null = null;
  private targetClient: DAVClient | null = null;
  private sourceRateLimiter: RateLimiter;
  private targetRateLimiter: RateLimiter;

  constructor(config: MigrationConfig, stateManager: StateManager) {
    this.config = config;
    this.stateManager = stateManager;

    // Initialize rate limiters with provider-specific limits
    const sourceLimit =
      config.options?.rateLimit?.source ||
      ProviderRateLimits[config.source.provider] ||
      ProviderRateLimits.generic;
    const targetLimit =
      config.options?.rateLimit?.target ||
      ProviderRateLimits[config.target.provider] ||
      ProviderRateLimits.generic;

    this.sourceRateLimiter = new RateLimiter(sourceLimit);
    this.targetRateLimiter = new RateLimiter(targetLimit);
  }

  /**
   * Helper: Extract displayName as string (handle objects from Baïkal/XML parsing)
   *
   * Baikal often returns empty displayName objects, so we fallback to URL parsing.
   * Example: /calendars/user/project-luna/ → "project-luna"
   */
  private getDisplayName(calendar: DAVCalendar, fallback: string = 'Unnamed Calendar'): string {
    // Try string displayName first
    if (typeof calendar.displayName === 'string' && calendar.displayName.trim()) {
      return calendar.displayName.trim();
    }

    // Handle complex objects (e.g., from Baïkal XML parsing)
    if (calendar.displayName && typeof calendar.displayName === 'object') {
      const obj = calendar.displayName as any;
      if (obj._text && String(obj._text).trim()) return String(obj._text).trim();
      if (obj.value && String(obj.value).trim()) return String(obj.value).trim();
      if (obj.toString && obj.toString() !== '[object Object]') {
        const strVal = obj.toString().trim();
        if (strVal) return strVal;
      }
    }

    // Fallback: Extract name from calendar URL (common for Baikal)
    // Example: /dav.php/calendars/tester/project-luna/ → "project-luna"
    if (calendar.url) {
      try {
        const urlPath = calendar.url.replace(/\/$/, ''); // Remove trailing slash
        const pathSegments = urlPath.split('/').filter(s => s.length > 0);

        // Get last meaningful segment (skip common prefixes like "dav.php", "calendars")
        for (let i = pathSegments.length - 1; i >= 0; i--) {
          const segment = pathSegments[i];
          // Skip technical segments
          if (!segment.includes('.php') && segment !== 'calendars' && segment !== 'addressbooks') {
            // Decode URL encoding and humanize (replace hyphens/underscores with spaces)
            const humanized = decodeURIComponent(segment)
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize words
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
   * Initialize clients and authenticate
   */
  async initialize(): Promise<void> {
    console.log(chalk.blue('Initializing DAV clients...'));

    // Create and authenticate source client
    console.log(`Source: ${this.config.source.provider}`);
    this.sourceClient = await ProviderFactory.createClient(this.config.source);

    // Create and authenticate target client
    console.log(`Target: ${this.config.target.provider}`);
    this.targetClient = await ProviderFactory.createClient(this.config.target);

    console.log(chalk.green('✓ Clients initialized and authenticated\n'));
  }

  /**
   * Execute migration
   */
  async migrate(): Promise<void> {
    if (!this.sourceClient || !this.targetClient) {
      throw new Error('Clients not initialized. Call initialize() first.');
    }

    // Initialize migration state
    this.stateManager.initializeMigration(
      this.config.source.provider,
      this.config.target.provider
    );

    try {
      // Fetch all calendars from source
      console.log(chalk.blue('Fetching calendars from source...'));
      await this.sourceRateLimiter.throttle();
      const sourceCalendars = await this.sourceClient.fetchCalendars();
      console.log(chalk.green(`✓ Found ${sourceCalendars.length} calendars\n`));

      // Filter calendars if filter is specified
      const filteredCalendars = this.filterCalendars(sourceCalendars);
      if (filteredCalendars.length === 0) {
        console.log(chalk.yellow('No calendars match the filter. Nothing to migrate.'));
        this.stateManager.completeMigration('cancelled');
        return;
      }

      // Migrate each calendar
      for (let i = 0; i < filteredCalendars.length; i++) {
        const sourceCalendar = filteredCalendars[i];
        console.log(
          chalk.blue(
            `\n[${i + 1}/${filteredCalendars.length}] Migrating calendar: ${this.getDisplayName(sourceCalendar)}`
          )
        );

        await this.migrateCalendar(sourceCalendar);
      }

      // Complete migration
      this.stateManager.completeMigration('completed');
      console.log(chalk.green('\n✓ Migration completed!'));
    } catch (error) {
      console.error(chalk.red(`\n✗ Migration failed: ${(error as Error).message}`));
      this.stateManager.completeMigration('failed');
      throw error;
    }
  }

  /**
   * Migrate a single calendar
   */
  private async migrateCalendar(sourceCalendar: DAVCalendar): Promise<void> {
    if (!this.sourceClient || !this.targetClient) {
      throw new Error('Clients not initialized');
    }

    // Fetch all events from source calendar
    console.log('  Fetching events from source calendar...');
    await this.sourceRateLimiter.throttle();
    const fetchOptions: any = {
      calendar: sourceCalendar,
    };
    if (this.config.options?.timeRange) {
      fetchOptions.timeRange = this.config.options.timeRange;
    }
    let sourceObjects = await this.sourceClient.fetchCalendarObjects(fetchOptions);
    console.log(chalk.green(`  ✓ Found ${sourceObjects.length} events`));

    if (sourceObjects.length === 0) {
      console.log(chalk.yellow('  No events to migrate'));
      return;
    }

    // Get or create target calendar
    const targetCalendar = await this.getOrCreateTargetCalendar(sourceCalendar);
    console.log(chalk.green(`  ✓ Target calendar: ${this.getDisplayName(targetCalendar)}`));

    // Fetch existing objects from target (for duplicate detection)
    console.log('  Fetching existing events from target calendar...');
    await this.targetRateLimiter.throttle();
    const targetObjects = await this.targetClient.fetchCalendarObjects({
      calendar: targetCalendar,
    });

    // Build set of existing UIDs on target
    const existingUIDs = new Set<string>();
    for (const obj of targetObjects) {
      try {
        const uid = UIDExtractor.extractUID(obj.data);
        if (uid) existingUIDs.add(uid);
      } catch (error) {
        console.warn(`  Warning: Failed to extract UID from target object: ${error}`);
      }
    }
    console.log(chalk.green(`  ✓ Found ${existingUIDs.size} existing events on target`));

    // Add calendar to state
    const sourceDisplayName = this.getDisplayName(sourceCalendar);
    const targetDisplayName = this.getDisplayName(targetCalendar);

    const calendarId = this.stateManager.addCalendar(
      sourceCalendar.url,
      sourceDisplayName,
      targetCalendar.url,
      targetDisplayName,
      sourceObjects.length
    );
    this.stateManager.startCalendar(calendarId);

    // Dry-run mode: just show what would be migrated
    if (this.config.options?.dryRun) {
      this.previewCalendarMigration(sourceObjects, existingUIDs, calendarId);
      return;
    }

    // Migrate events with progress bar
    await this.migrateEvents(sourceObjects, targetCalendar, existingUIDs, calendarId);

    this.stateManager.completeCalendar(calendarId);
  }

  /**
   * Migrate events from source to target
   */
  private async migrateEvents(
    sourceObjects: DAVCalendarObject[],
    targetCalendar: DAVCalendar,
    existingUIDs: Set<string>,
    calendarId: number
  ): Promise<void> {
    if (!this.targetClient) {
      throw new Error('Target client not initialized');
    }

    // Create progress bar
    const progressBar = new cliProgress.SingleBar(
      {
        format:
          '  Progress |' +
          chalk.cyan('{bar}') +
          '| {percentage}% | {value}/{total} events | Migrated: {migrated} | Skipped: {skipped} | Failed: {failed}',
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
        const uid = UIDExtractor.extractUIDOrThrow(sourceObject.data);

        // Check if already migrated in previous run (resume capability)
        if (this.stateManager.isMigrated(calendarId, uid)) {
          skipped++;
          progressBar.update({ migrated, skipped, failed });
          continue;
        }

        // Check if UID exists on target
        if (existingUIDs.has(uid) && !this.config.options?.overwrite) {
          this.stateManager.logSkipped(calendarId, uid);
          skipped++;
          progressBar.update({ migrated, skipped, failed });
          continue;
        }

        // Migrate event
        await this.targetRateLimiter.executeWithRetry(async () => {
          if (!this.targetClient) throw new Error('Target client not initialized');

          // Generate safe filename from UID (required for Google/ZOHO)
          const filename = `${UIDExtractor.generateFilename(uid)}.ics`;

          // Create event on target
          const response = await this.targetClient.createCalendarObject({
            calendar: targetCalendar,
            filename,
            iCalString: sourceObject.data,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        });

        this.stateManager.logSuccess(calendarId, uid);
        migrated++;
        progressBar.increment({ migrated, skipped, failed });
      } catch (error) {
        const uid = UIDExtractor.extractUIDRegex(sourceObject.data) || 'unknown';
        const errorMsg = (error as Error).message;
        this.stateManager.logFailure(calendarId, uid, errorMsg);
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
  private previewCalendarMigration(
    sourceObjects: DAVCalendarObject[],
    existingUIDs: Set<string>,
    calendarId: number
  ): void {
    let wouldMigrate = 0;
    let wouldSkip = 0;
    let errors = 0;

    for (const sourceObject of sourceObjects) {
      try {
        const uid = UIDExtractor.extractUID(sourceObject.data);
        if (!uid) {
          errors++;
          continue;
        }

        // Check if already migrated in previous run
        if (this.stateManager.isMigrated(calendarId, uid)) {
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

    console.log(chalk.cyan('  Preview (dry-run):'));
    console.log(chalk.green(`    Would migrate: ${wouldMigrate} events`));
    console.log(chalk.yellow(`    Would skip: ${wouldSkip} events (already exist)`));
    if (errors > 0) {
      console.log(chalk.red(`    Errors: ${errors} events (failed to parse UID)`));
    }
  }

  /**
   * Get or create target calendar (match by display name)
   */
  private async getOrCreateTargetCalendar(sourceCalendar: DAVCalendar): Promise<DAVCalendar> {
    if (!this.targetClient) {
      throw new Error('Target client not initialized');
    }

    // Fetch existing calendars on target
    await this.targetRateLimiter.throttle();
    const targetCalendars = await this.targetClient.fetchCalendars();

    // Try to find existing calendar with same display name
    const sourceDisplayName = this.getDisplayName(sourceCalendar);
    const existingCalendar = targetCalendars.find(
      (cal) => this.getDisplayName(cal) === sourceDisplayName
    );

    if (existingCalendar) {
      return existingCalendar;
    }

    // Check if target is Google (which doesn't support calendar creation via CalDAV)
    if (this.config.target.provider === 'google') {
      throw new Error(
        `Calendar "${sourceDisplayName}" not found on Google Calendar.\n\n` +
        `Google CalDAV API does not support creating calendars.\n` +
        `Please create the calendar manually on Google Calendar first:\n` +
        `  1. Go to https://calendar.google.com\n` +
        `  2. Create a new calendar named: "${sourceDisplayName}"\n` +
        `  3. Re-run the migration\n\n` +
        `Alternative: Use calendar mapping in config to migrate to an existing calendar.`
      );
    }

    // Create new calendar on target (non-Google providers)
    console.log(`  Creating new calendar on target: ${sourceDisplayName}`);
    await this.targetRateLimiter.throttle();

    // Generate unique URL for new calendar
    const displayNameStr = this.getDisplayName(sourceCalendar, 'Migrated Calendar');
    const calendarName = displayNameStr.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() ||
      `calendar-${Date.now()}`;
    const newCalendarUrl = `${this.targetClient.account?.homeUrl}/${calendarName}/`;

    await this.targetClient.makeCalendar({
      url: newCalendarUrl,
      props: {
        displayname: displayNameStr,
        'C:calendar-description': `Migrated from ${this.config.source.provider}`,
      },
    });

    // Fetch calendars again to get the newly created one
    await this.targetRateLimiter.throttle();
    const updatedCalendars = await this.targetClient.fetchCalendars();
    const newCalendar = updatedCalendars.find((cal) => cal.url === newCalendarUrl);

    if (!newCalendar) {
      throw new Error(`Failed to create calendar: ${displayNameStr}`);
    }

    return newCalendar;
  }

  /**
   * Filter calendars based on config
   */
  private filterCalendars(calendars: DAVCalendar[]): DAVCalendar[] {
    if (!this.config.options?.calendarFilter) {
      return calendars;
    }

    try {
      const regex = new RegExp(this.config.options.calendarFilter);
      const filtered = calendars.filter((cal) => {
        const displayName = this.getDisplayName(cal, '');
        return regex.test(displayName);
      });
      console.log(
        chalk.yellow(
          `Filtered ${calendars.length} → ${filtered.length} calendars (pattern: ${this.config.options.calendarFilter})`
        )
      );
      return filtered;
    } catch (error) {
      console.warn(
        chalk.yellow(`Invalid calendar filter regex: ${this.config.options.calendarFilter}`)
      );
      return calendars;
    }
  }

  /**
   * Disconnect clients
   */
  async cleanup(): Promise<void> {
    // tsdav doesn't have explicit disconnect, but we can clear references
    this.sourceClient = null;
    this.targetClient = null;
  }
}
