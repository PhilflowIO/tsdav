/**
 * Migration Engine
 * Main orchestrator for DAV migration (CalDAV and CardDAV)
 * Handles source/target coordination, uses specialized migrators for each type
 */

import { DAVClient } from 'tsdav';
import chalk from 'chalk';
import { MigrationConfig } from '../types/config';
import { StateManager } from './StateManager';
import { ProviderFactory } from './ProviderFactory';
import { RateLimiter, ProviderRateLimits } from './RateLimiter';
import { CalendarCollectionMigrator } from './CalendarCollectionMigrator';
import { AddressBookCollectionMigrator } from './AddressBookCollectionMigrator';
import { DAVCollection } from './CollectionMigrator';

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
   * Execute migration based on config type (calendar or contacts)
   */
  async migrate(): Promise<void> {
    if (!this.sourceClient || !this.targetClient) {
      throw new Error('Clients not initialized. Call initialize() first.');
    }

    // Determine migration type (default to calendar for backwards compatibility)
    const migrationType = this.config.migrationType || 'calendar';

    // Initialize migration state
    this.stateManager.initializeMigration(
      this.config.source.provider,
      this.config.target.provider
    );

    try {
      if (migrationType === 'calendar') {
        await this.migrateCalendars();
      } else if (migrationType === 'contacts') {
        await this.migrateContacts();
      } else {
        throw new Error(`Unsupported migration type: ${migrationType}`);
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
   * Migrate calendars (CalDAV) - includes events and tasks
   */
  private async migrateCalendars(): Promise<void> {
    if (!this.sourceClient || !this.targetClient) {
      throw new Error('Clients not initialized');
    }

    // Create calendar migrator
    const migrator = new CalendarCollectionMigrator(
      this.config,
      this.stateManager,
      this.sourceClient,
      this.targetClient,
      this.sourceRateLimiter,
      this.targetRateLimiter
    );

    // Fetch all calendars from source
    console.log(chalk.blue('Fetching calendars from source...'));
    await this.sourceRateLimiter.throttle();
    const sourceCalendars = await migrator.fetchSourceCollections();
    console.log(chalk.green(`✓ Found ${sourceCalendars.length} calendars\n`));

    // Filter calendars if filter is specified
    const filteredCalendars = migrator['filterCollections'](sourceCalendars);
    if (filteredCalendars.length === 0) {
      console.log(chalk.yellow('No calendars match the filter. Nothing to migrate.'));
      this.stateManager.completeMigration('cancelled');
      return;
    }

    // Migrate each calendar
    for (let i = 0; i < filteredCalendars.length; i++) {
      const sourceCalendar = filteredCalendars[i];
      const displayName = migrator['getDisplayName'](sourceCalendar);
      console.log(
        chalk.blue(
          `\n[${i + 1}/${filteredCalendars.length}] Migrating calendar: ${displayName}`
        )
      );

      await migrator.migrateCollection(sourceCalendar);
    }
  }

  /**
   * Migrate contacts (CardDAV)
   */
  private async migrateContacts(): Promise<void> {
    if (!this.sourceClient || !this.targetClient) {
      throw new Error('Clients not initialized');
    }

    // Create addressbook migrator
    const migrator = new AddressBookCollectionMigrator(
      this.config,
      this.stateManager,
      this.sourceClient,
      this.targetClient,
      this.sourceRateLimiter,
      this.targetRateLimiter
    );

    // Fetch all addressbooks from source
    console.log(chalk.blue('Fetching addressbooks from source...'));
    await this.sourceRateLimiter.throttle();
    const sourceAddressBooks = await migrator.fetchSourceCollections();
    console.log(chalk.green(`✓ Found ${sourceAddressBooks.length} addressbook(s)\n`));

    // Filter addressbooks if filter is specified
    const filteredAddressBooks = migrator['filterCollections'](sourceAddressBooks);
    if (filteredAddressBooks.length === 0) {
      console.log(chalk.yellow('No addressbooks match the filter. Nothing to migrate.'));
      this.stateManager.completeMigration('cancelled');
      return;
    }

    // Migrate each addressbook
    for (let i = 0; i < filteredAddressBooks.length; i++) {
      const sourceAddressBook = filteredAddressBooks[i];
      const displayName = migrator['getDisplayName'](sourceAddressBook);
      console.log(
        chalk.blue(
          `\n[${i + 1}/${filteredAddressBooks.length}] Migrating addressbook: ${displayName}`
        )
      );

      await migrator.migrateCollection(sourceAddressBook);
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
