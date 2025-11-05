/**
 * Integration Tests for Migration Engine
 * Tests end-to-end migration flow with in-memory mock CalDAV server
 *
 * FOCUS: Does the migration actually work?
 * - Full migration
 * - No duplicates (idempotent)
 * - Resume capability
 * - Multi-calendar
 * - DSGVO compliance
 */

import { DAVClient, DAVCalendar, DAVCalendarObject } from 'tsdav';
import { MigrationEngine } from '../../src/core/MigrationEngine';
import { StateManager } from '../../src/core/StateManager';
import { ProviderFactory } from '../../src/core/ProviderFactory';
import { MigrationConfig } from '../../src/types/config';
import * as fs from 'fs';
import * as path from 'path';

// ===== Mock CalDAV Server =====
// Simulates a real CalDAV server in memory
class MockDAVServer {
  calendars: Map<string, DAVCalendar> = new Map();
  events: Map<string, DAVCalendarObject[]> = new Map();
  private eventCounter = 1;

  addCalendar(displayName: string, url: string): DAVCalendar {
    const calendar: DAVCalendar = {
      url,
      displayName,
      ctag: `ctag-${Date.now()}`,
      description: '',
      timezone: 'UTC',
      components: ['VEVENT'],
      resourcetype: ['calendar'],
    };
    this.calendars.set(url, calendar);
    this.events.set(url, []);
    return calendar;
  }

  addEvent(calendarUrl: string, uid: string, summary: string): DAVCalendarObject {
    const icsData = this.createICalData(uid, summary);
    const event: DAVCalendarObject = {
      url: `${calendarUrl}event-${this.eventCounter++}.ics`,
      data: icsData,
      etag: `"etag-${Date.now()}-${Math.random()}"`,
    };
    const events = this.events.get(calendarUrl) || [];
    events.push(event);
    this.events.set(calendarUrl, events);
    return event;
  }

  createICalData(uid: string, summary: string): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:20250101T120000Z
DTSTART:20250115T100000Z
DTEND:20250115T110000Z
SUMMARY:${summary}
DESCRIPTION:Test event description for ${summary}
LOCATION:Test Location
LAST-MODIFIED:20250101T120000Z
END:VEVENT
END:VCALENDAR`;
  }

  fetchCalendars(): DAVCalendar[] {
    return Array.from(this.calendars.values());
  }

  fetchCalendarObjects(calendarUrl: string): DAVCalendarObject[] {
    return this.events.get(calendarUrl) || [];
  }

  createCalendarObject(calendarUrl: string, data: string): { ok: boolean; status: number } {
    const events = this.events.get(calendarUrl) || [];
    const event: DAVCalendarObject = {
      url: `${calendarUrl}event-${this.eventCounter++}.ics`,
      data,
      etag: `"etag-${Date.now()}-${Math.random()}"`,
    };
    events.push(event);
    this.events.set(calendarUrl, events);
    return { ok: true, status: 201 };
  }

  makeCalendar(url: string, displayName: string): void {
    this.addCalendar(displayName, url);
  }

  getEventCount(calendarUrl: string): number {
    return (this.events.get(calendarUrl) || []).length;
  }

  getTotalEventCount(): number {
    let total = 0;
    for (const events of this.events.values()) {
      total += events.length;
    }
    return total;
  }
}

// ===== Mock DAVClient Factory =====
function createMockDAVClient(server: MockDAVServer): any {
  return {
    login: jest.fn().mockResolvedValue(undefined),
    // fetchCalendars now dynamically fetches from server
    fetchCalendars: jest.fn().mockImplementation(() => Promise.resolve(server.fetchCalendars())),
    fetchCalendarObjects: jest.fn().mockImplementation((options: any) => {
      const calendarUrl = options.calendar.url;
      return Promise.resolve(server.fetchCalendarObjects(calendarUrl));
    }),
    createCalendarObject: jest.fn().mockImplementation((options: any) => {
      const calendarUrl = options.calendar.url;
      return Promise.resolve(server.createCalendarObject(calendarUrl, options.iCalString));
    }),
    makeCalendar: jest.fn().mockImplementation((options: any) => {
      const displayName = options.props.displayname || 'Unnamed';
      server.makeCalendar(options.url, displayName);
      return Promise.resolve(undefined);
    }),
    account: {
      homeUrl: 'https://mock-target.com/dav/',
    },
  };
}

// ===== Test Setup =====
describe('Migration Integration Tests', () => {
  let sourceServer: MockDAVServer;
  let targetServer: MockDAVServer;
  let config: MigrationConfig;
  let stateFilePath: string;

  beforeEach(() => {
    // Create fresh mock servers
    sourceServer = new MockDAVServer();
    targetServer = new MockDAVServer();

    // Create temporary state file path
    stateFilePath = path.join(__dirname, `test-state-${Date.now()}.json`);

    // Mock ProviderFactory to return our mock clients
    jest.spyOn(ProviderFactory, 'createClient').mockImplementation(async (providerConfig) => {
      if (providerConfig.provider === 'google') {
        // Source: return mock client for source server
        return createMockDAVClient(sourceServer) as any;
      } else {
        // Target: return mock client for target server
        return createMockDAVClient(targetServer) as any;
      }
    });

    // Default config
    config = {
      source: {
        provider: 'google',
        serverUrl: 'https://mock-source.com',
        authMethod: 'Oauth',
        credentials: {
          username: 'test@example.com',
          clientId: 'test-client',
          clientSecret: 'test-secret',
          refreshToken: 'test-refresh-token',
        },
      },
      target: {
        provider: 'baikal',
        serverUrl: 'https://mock-target.com',
        authMethod: 'Basic',
        credentials: {
          username: 'testuser',
          password: 'testpass',
        },
      },
      options: {
        overwrite: false,
        interactive: false,
        dryRun: false,
      },
    };
  });

  afterEach(() => {
    // Clean up state file
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }
    jest.restoreAllMocks();
  });

  // ===== TEST 1: Full Migration =====
  test('1. Full migration: 10 events source → target', async () => {
    // Setup: Source with 10 events, empty target
    const sourceCal = sourceServer.addCalendar('Test Calendar', 'https://mock-source.com/cal1/');
    for (let i = 1; i <= 10; i++) {
      sourceServer.addEvent(sourceCal.url, `uid-${i}@example.com`, `Event ${i}`);
    }

    // Create StateManager and MigrationEngine
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);

    // Run migration
    await engine.initialize();
    await engine.migrate();

    // Verify: Target has 10 events
    expect(targetServer.getTotalEventCount()).toBe(10);

    // Verify: State has 10 migrated UIDs
    const state = stateManager.getState();
    expect(state.calendars.length).toBe(1);
    expect(state.calendars[0].migratedUIDs.length).toBe(10);
    expect(state.calendars[0].skippedUIDs.length).toBe(0);
    expect(state.calendars[0].failedUIDs.length).toBe(0);
    expect(state.status).toBe('completed');

    // Verify: All UIDs are correct
    for (let i = 1; i <= 10; i++) {
      expect(state.calendars[0].migratedUIDs).toContain(`uid-${i}@example.com`);
    }
  }, 30000);

  // ===== TEST 2: Idempotent (No Duplicates) =====
  test('2. Idempotent: Second run creates no duplicates', async () => {
    // Setup: Source with 5 events
    const sourceCal = sourceServer.addCalendar('Test Calendar', 'https://mock-source.com/cal1/');
    for (let i = 1; i <= 5; i++) {
      sourceServer.addEvent(sourceCal.url, `uid-${i}@example.com`, `Event ${i}`);
    }

    // First migration
    const stateManager1 = new StateManager(stateFilePath, true);
    const engine1 = new MigrationEngine(config, stateManager1);
    await engine1.initialize();
    await engine1.migrate();

    // Verify: 5 events migrated
    expect(targetServer.getTotalEventCount()).toBe(5);
    const state1 = stateManager1.getState();
    expect(state1.calendars[0].migratedUIDs.length).toBe(5);

    // Second migration (NEW state manager, same config)
    // This tests if duplicate detection works by checking existing UIDs on target
    const stateManager2 = new StateManager(stateFilePath + '.second', true);
    const engine2 = new MigrationEngine(config, stateManager2);
    await engine2.initialize();
    await engine2.migrate();

    // Verify: Still only 5 events (NO duplicates!)
    expect(targetServer.getTotalEventCount()).toBe(5);

    // Verify: State shows 0 migrated, 5 skipped (already exist on target)
    const state2 = stateManager2.getState();
    expect(state2.calendars[0].skippedUIDs.length).toBe(5);
    expect(state2.calendars[0].migratedUIDs.length).toBe(0);
  }, 30000);

  // ===== TEST 3: State Persistence & Resume =====
  test('3. State file can be saved and loaded (resume capability)', async () => {
    // Setup: Create state with migration data
    const stateManager1 = new StateManager(stateFilePath, true);
    stateManager1.initializeMigration('google', 'baikal');

    const calId = stateManager1.addCalendar(
      'https://source.com/cal1/',
      'Test Calendar',
      'https://target.com/cal1/',
      'Test Calendar',
      10
    );
    stateManager1.startCalendar(calId);

    // Log some migrations
    stateManager1.logSuccess(calId, 'uid-1@example.com');
    stateManager1.logSuccess(calId, 'uid-2@example.com');
    stateManager1.logSuccess(calId, 'uid-3@example.com');
    stateManager1.logSkipped(calId, 'uid-4@example.com');
    stateManager1.logFailure(calId, 'uid-5@example.com', 'HTTP 500');

    stateManager1.completeCalendar(calId);
    stateManager1.completeMigration('completed');

    // Verify state was saved
    expect(fs.existsSync(stateFilePath)).toBe(true);

    // Load state from file
    const stateManager2 = StateManager.loadFromFile(stateFilePath);
    const loadedState = stateManager2.getState();

    // Verify: State was loaded correctly
    expect(loadedState.status).toBe('completed');
    expect(loadedState.sourceProvider).toBe('google');
    expect(loadedState.targetProvider).toBe('baikal');
    expect(loadedState.calendars.length).toBe(1);

    // Verify: Calendar state preserved
    expect(loadedState.calendars[0].migratedUIDs.length).toBe(3);
    expect(loadedState.calendars[0].skippedUIDs.length).toBe(1);
    expect(loadedState.calendars[0].failedUIDs.length).toBe(1);

    // Verify: isMigrated() works after resume
    expect(stateManager2.isMigrated(calId, 'uid-1@example.com')).toBe(true);
    expect(stateManager2.isMigrated(calId, 'uid-999@example.com')).toBe(false);

    // Verify: Summary is preserved
    expect(loadedState.summary).toBeDefined();
    expect(loadedState.summary?.migratedEvents).toBe(3);
    expect(loadedState.summary?.skippedEvents).toBe(1);
    expect(loadedState.summary?.failedEvents).toBe(1);
  }, 30000);

  // ===== TEST 4: Multi-Calendar Migration =====
  test('4. Multi-calendar: 3 calendars with 5 events each', async () => {
    // Setup: 3 source calendars with 5 events each
    for (let c = 1; c <= 3; c++) {
      const cal = sourceServer.addCalendar(`Calendar ${c}`, `https://mock-source.com/cal${c}/`);
      for (let e = 1; e <= 5; e++) {
        sourceServer.addEvent(cal.url, `uid-cal${c}-event${e}@example.com`, `Cal${c} Event${e}`);
      }
    }

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: 15 total events migrated (3 calendars × 5 events)
    expect(targetServer.getTotalEventCount()).toBe(15);

    // Verify: 3 calendars created on target
    expect(targetServer.calendars.size).toBe(3);

    // Verify: State tracks 3 calendars
    const state = stateManager.getState();
    expect(state.calendars.length).toBe(3);

    // Verify: Each calendar has 5 migrated events
    for (let i = 0; i < 3; i++) {
      expect(state.calendars[i].migratedUIDs.length).toBe(5);
      expect(state.calendars[i].status).toBe('completed');
    }
  }, 30000);

  // ===== TEST 5: DSGVO Compliance =====
  test('5. DSGVO: State file contains NO event content', async () => {
    // Setup: Events with sensitive content
    const sourceCal = sourceServer.addCalendar('Test Calendar', 'https://mock-source.com/cal1/');
    sourceServer.addEvent(sourceCal.url, 'uid-1@example.com', 'Secret Meeting with John');
    sourceServer.addEvent(sourceCal.url, 'uid-2@example.com', 'Confidential Project Review');
    sourceServer.addEvent(sourceCal.url, 'uid-3@example.com', 'Personal Doctor Appointment');

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Read state file as JSON
    const stateFileContent = fs.readFileSync(stateFilePath, 'utf-8');
    const stateJSON = JSON.parse(stateFileContent);

    // Verify: State file contains UIDs
    expect(stateJSON.calendars[0].migratedUIDs).toContain('uid-1@example.com');
    expect(stateJSON.calendars[0].migratedUIDs).toContain('uid-2@example.com');
    expect(stateJSON.calendars[0].migratedUIDs).toContain('uid-3@example.com');

    // Verify: State file does NOT contain sensitive content
    const stateString = JSON.stringify(stateJSON).toLowerCase();
    expect(stateString).not.toContain('secret meeting');
    expect(stateString).not.toContain('john');
    expect(stateString).not.toContain('confidential');
    expect(stateString).not.toContain('project review');
    expect(stateString).not.toContain('doctor appointment');
    expect(stateString).not.toContain('personal');

    // Verify: Only allowed keys present in state
    const allowedKeys = [
      'migrationId',
      'startedAt',
      'completedAt',
      'sourceProvider',
      'targetProvider',
      'status',
      'calendars',
      'summary',
    ];
    for (const key of Object.keys(stateJSON)) {
      expect(allowedKeys).toContain(key);
    }

    // Verify: Calendar state only has allowed keys
    const calendarAllowedKeys = [
      'sourceCalendarUrl',
      'sourceCalendarName',
      'targetCalendarUrl',
      'targetCalendarName',
      'totalEvents',
      'processedEvents',
      'migratedUIDs',
      'skippedUIDs',
      'failedUIDs',
      'status',
      'startedAt',
      'completedAt',
    ];
    for (const key of Object.keys(stateJSON.calendars[0])) {
      expect(calendarAllowedKeys).toContain(key);
    }

    console.log('✓ DSGVO Compliance: State file contains only metadata, no event content');
  }, 30000);
});
