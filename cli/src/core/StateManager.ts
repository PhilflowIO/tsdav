/**
 * State Manager
 * DSGVO-COMPLIANT: Stores ONLY metadata (UIDs, status codes, timestamps)
 * NEVER stores calendar content (titles, descriptions, attendees, locations, etc.)
 * Enables resume capability after network failures or interruptions
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  MigrationState,
  CalendarMigrationState,
  FailedEvent,
  MigrationSummary,
  ProviderType,
} from '../types/config';

export class StateManager {
  private state: MigrationState;
  private stateFilePath: string;
  private autoSave: boolean;

  /**
   * @param stateFilePath - Path to state file (default: .migration-state.json)
   * @param autoSave - Automatically save after each update (default: true)
   */
  constructor(stateFilePath: string = '.migration-state.json', autoSave: boolean = true) {
    this.stateFilePath = stateFilePath;
    this.autoSave = autoSave;

    // Initialize empty state
    this.state = {
      migrationId: uuidv4(),
      startedAt: new Date().toISOString(),
      sourceProvider: 'generic',
      targetProvider: 'generic',
      status: 'in_progress',
      calendars: [],
    };
  }

  /**
   * Initialize new migration state
   * @param sourceProvider - Source provider type
   * @param targetProvider - Target provider type
   */
  initializeMigration(sourceProvider: ProviderType, targetProvider: ProviderType): void {
    this.state = {
      migrationId: uuidv4(),
      startedAt: new Date().toISOString(),
      sourceProvider,
      targetProvider,
      status: 'in_progress',
      calendars: [],
    };

    console.log(`Migration ID: ${this.state.migrationId}`);
    this.save();
  }

  /**
   * Load existing state from file (for resume capability)
   * @param filePath - Path to state file
   * @returns StateManager instance with loaded state
   */
  static loadFromFile(filePath: string): StateManager {
    if (!fs.existsSync(filePath)) {
      throw new Error(`State file not found: ${filePath}`);
    }

    const manager = new StateManager(filePath);
    const data = fs.readFileSync(filePath, 'utf-8');
    manager.state = JSON.parse(data) as MigrationState;

    console.log(`Loaded migration state: ${manager.state.migrationId}`);
    console.log(`Status: ${manager.state.status}, Started: ${manager.state.startedAt}`);

    return manager;
  }

  /**
   * Add a new calendar to track
   * @param sourceUrl - Source calendar URL
   * @param sourceName - Source calendar display name
   * @param targetUrl - Target calendar URL
   * @param targetName - Target calendar display name
   * @param totalEvents - Total number of events in calendar
   * @returns Calendar ID (index in array)
   */
  addCalendar(
    sourceUrl: string,
    sourceName: string,
    targetUrl: string,
    targetName: string,
    totalEvents: number
  ): number {
    const calendar: CalendarMigrationState = {
      sourceCalendarUrl: sourceUrl,
      sourceCalendarName: sourceName,
      targetCalendarUrl: targetUrl,
      targetCalendarName: targetName,
      totalEvents,
      processedEvents: 0,
      migratedUIDs: [],
      skippedUIDs: [],
      failedUIDs: [],
      status: 'pending',
      startedAt: new Date().toISOString(),
    };

    this.state.calendars.push(calendar);
    if (this.autoSave) this.save();

    return this.state.calendars.length - 1;
  }

  /**
   * Mark calendar as in progress
   * @param calendarId - Calendar index
   */
  startCalendar(calendarId: number): void {
    this.state.calendars[calendarId].status = 'in_progress';
    this.state.calendars[calendarId].startedAt = new Date().toISOString();
    if (this.autoSave) this.save();
  }

  /**
   * Mark calendar as completed
   * @param calendarId - Calendar index
   */
  completeCalendar(calendarId: number): void {
    this.state.calendars[calendarId].status = 'completed';
    this.state.calendars[calendarId].completedAt = new Date().toISOString();
    if (this.autoSave) this.save();
  }

  /**
   * Mark calendar as failed
   * @param calendarId - Calendar index
   */
  failCalendar(calendarId: number): void {
    this.state.calendars[calendarId].status = 'failed';
    this.state.calendars[calendarId].completedAt = new Date().toISOString();
    if (this.autoSave) this.save();
  }

  /**
   * Log successful migration (DSGVO-compliant: UID only)
   * @param calendarId - Calendar index
   * @param uid - Event UID
   */
  logSuccess(calendarId: number, uid: string): void {
    const calendar = this.state.calendars[calendarId];
    calendar.migratedUIDs.push(uid);
    calendar.processedEvents++;
    if (this.autoSave) this.save();
  }

  /**
   * Log skipped event (DSGVO-compliant: UID only)
   * @param calendarId - Calendar index
   * @param uid - Event UID
   */
  logSkipped(calendarId: number, uid: string): void {
    const calendar = this.state.calendars[calendarId];
    calendar.skippedUIDs.push(uid);
    calendar.processedEvents++;
    if (this.autoSave) this.save();
  }

  /**
   * Log failed migration (DSGVO-compliant: UID + error code only)
   * @param calendarId - Calendar index
   * @param uid - Event UID
   * @param error - Error message (HTTP status or error description)
   */
  logFailure(calendarId: number, uid: string, error: string): void {
    const calendar = this.state.calendars[calendarId];
    calendar.failedUIDs.push({
      uid,
      error,
      timestamp: new Date().toISOString(),
    });
    calendar.processedEvents++;
    if (this.autoSave) this.save();
  }

  /**
   * Check if UID was already migrated (for resume capability)
   * @param calendarId - Calendar index
   * @param uid - Event UID
   * @returns true if already migrated
   */
  isMigrated(calendarId: number, uid: string): boolean {
    const calendar = this.state.calendars[calendarId];
    return calendar.migratedUIDs.includes(uid);
  }

  /**
   * Check if UID was already skipped
   * @param calendarId - Calendar index
   * @param uid - Event UID
   * @returns true if already skipped
   */
  isSkipped(calendarId: number, uid: string): boolean {
    const calendar = this.state.calendars[calendarId];
    return calendar.skippedUIDs.includes(uid);
  }

  /**
   * Complete migration and generate summary
   * @param status - Final status ('completed' | 'failed' | 'cancelled')
   */
  completeMigration(status: 'completed' | 'failed' | 'cancelled' = 'completed'): void {
    this.state.status = status;
    this.state.completedAt = new Date().toISOString();
    this.state.summary = this.generateSummary();
    this.save();
  }

  /**
   * Generate migration summary statistics
   * @returns Migration summary
   */
  private generateSummary(): MigrationSummary {
    const totalCalendars = this.state.calendars.length;
    const totalEvents = this.state.calendars.reduce((sum, cal) => sum + cal.totalEvents, 0);
    const migratedEvents = this.state.calendars.reduce(
      (sum, cal) => sum + cal.migratedUIDs.length,
      0
    );
    const skippedEvents = this.state.calendars.reduce(
      (sum, cal) => sum + cal.skippedUIDs.length,
      0
    );
    const failedEvents = this.state.calendars.reduce(
      (sum, cal) => sum + cal.failedUIDs.length,
      0
    );

    const startTime = new Date(this.state.startedAt).getTime();
    const endTime = this.state.completedAt
      ? new Date(this.state.completedAt).getTime()
      : Date.now();
    const duration = endTime - startTime;

    return {
      totalCalendars,
      totalEvents,
      migratedEvents,
      skippedEvents,
      failedEvents,
      duration,
    };
  }

  /**
   * Save state to file
   */
  save(): void {
    const dir = path.dirname(this.stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  /**
   * Get current state (read-only)
   * @returns Current migration state
   */
  getState(): Readonly<MigrationState> {
    return this.state;
  }

  /**
   * Get calendar state
   * @param calendarId - Calendar index
   * @returns Calendar state
   */
  getCalendar(calendarId: number): Readonly<CalendarMigrationState> {
    return this.state.calendars[calendarId];
  }

  /**
   * Get all failed events across all calendars
   * @returns Array of failed events
   */
  getAllFailedEvents(): Array<FailedEvent & { calendarName: string }> {
    const failed: Array<FailedEvent & { calendarName: string }> = [];

    for (const calendar of this.state.calendars) {
      for (const failedEvent of calendar.failedUIDs) {
        failed.push({
          ...failedEvent,
          calendarName: calendar.sourceCalendarName,
        });
      }
    }

    return failed;
  }

  /**
   * Get progress percentage for a calendar
   * @param calendarId - Calendar index
   * @returns Progress percentage (0-100)
   */
  getCalendarProgress(calendarId: number): number {
    const calendar = this.state.calendars[calendarId];
    if (calendar.totalEvents === 0) return 100;
    return Math.round((calendar.processedEvents / calendar.totalEvents) * 100);
  }

  /**
   * Get overall migration progress percentage
   * @returns Progress percentage (0-100)
   */
  getOverallProgress(): number {
    const totalEvents = this.state.calendars.reduce((sum, cal) => sum + cal.totalEvents, 0);
    const processedEvents = this.state.calendars.reduce(
      (sum, cal) => sum + cal.processedEvents,
      0
    );

    if (totalEvents === 0) return 100;
    return Math.round((processedEvents / totalEvents) * 100);
  }

  /**
   * Print summary to console
   */
  printSummary(): void {
    const summary = this.state.summary || this.generateSummary();

    console.log('\n=== Migration Summary ===');
    console.log(`Status: ${this.state.status}`);
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`\nCalendars: ${summary.totalCalendars}`);
    console.log(`Total Events: ${summary.totalEvents}`);
    console.log(`  ✓ Migrated: ${summary.migratedEvents}`);
    console.log(`  ⊘ Skipped: ${summary.skippedEvents}`);
    console.log(`  ✗ Failed: ${summary.failedEvents}`);

    if (summary.failedEvents > 0) {
      console.log('\nFailed Events:');
      const failed = this.getAllFailedEvents();
      for (const event of failed.slice(0, 10)) {
        // Show first 10
        console.log(`  - ${event.uid} (${event.calendarName}): ${event.error}`);
      }
      if (failed.length > 10) {
        console.log(`  ... and ${failed.length - 10} more`);
      }
    }

    console.log(`\nState file: ${this.stateFilePath}`);
  }
}
