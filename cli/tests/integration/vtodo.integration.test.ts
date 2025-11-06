/**
 * Integration Tests for VTODO (Tasks) Migration
 * Tests end-to-end task migration flow alongside calendar events
 *
 * FOCUS: Does VTODO migration work correctly?
 * - Task-only calendars
 * - Mixed calendars (events + tasks)
 * - Object type counting (VEVENT vs VTODO)
 * - Task filtering when user opts out
 */

import { DAVClient, DAVCalendar, DAVCalendarObject } from 'tsdav';
import { MigrationEngine } from '../../src/core/MigrationEngine';
import { StateManager } from '../../src/core/StateManager';
import { ProviderFactory } from '../../src/core/ProviderFactory';
import { MigrationConfig } from '../../src/types/config';
import * as fs from 'fs';
import * as path from 'path';

// Mock readline module to automatically answer 'y' to prompts
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((query: string, callback: (answer: string) => void) => {
      // Automatically answer 'y' to migrate tasks
      callback('y');
    }),
    close: jest.fn(),
  })),
}));

// ===== Mock CalDAV Server with VTODO Support =====
class MockCalDAVServer {
  calendars: Map<string, DAVCalendar> = new Map();
  objects: Map<string, DAVCalendarObject[]> = new Map();
  private objectCounter = 1;

  addCalendar(displayName: string, url: string): DAVCalendar {
    const calendar: DAVCalendar = {
      url,
      displayName,
      ctag: `ctag-${Date.now()}`,
      description: '',
      timezone: 'UTC',
      components: ['VEVENT', 'VTODO'],
      resourcetype: ['calendar'],
    };
    this.calendars.set(url, calendar);
    this.objects.set(url, []);
    return calendar;
  }

  addEvent(calendarUrl: string, uid: string, summary: string): DAVCalendarObject {
    const icsData = this.createEventData(uid, summary);
    const event: DAVCalendarObject = {
      url: `${calendarUrl}event-${this.objectCounter++}.ics`,
      data: icsData,
      etag: `"etag-${Date.now()}-${Math.random()}"`,
    };
    const objects = this.objects.get(calendarUrl) || [];
    objects.push(event);
    this.objects.set(calendarUrl, objects);
    return event;
  }

  addTask(calendarUrl: string, uid: string, summary: string): DAVCalendarObject {
    const icsData = this.createTaskData(uid, summary);
    const task: DAVCalendarObject = {
      url: `${calendarUrl}task-${this.objectCounter++}.ics`,
      data: icsData,
      etag: `"etag-${Date.now()}-${Math.random()}"`,
    };
    const objects = this.objects.get(calendarUrl) || [];
    objects.push(task);
    this.objects.set(calendarUrl, objects);
    return task;
  }

  createEventData(uid: string, summary: string): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:20250101T120000Z
DTSTART:20250115T100000Z
DTEND:20250115T110000Z
SUMMARY:${summary}
DESCRIPTION:Test event
LAST-MODIFIED:20250101T120000Z
END:VEVENT
END:VCALENDAR`;
  }

  createTaskData(uid: string, summary: string): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:${uid}
DTSTAMP:20250101T120000Z
SUMMARY:${summary}
DESCRIPTION:Test task
DUE:20250120T000000Z
STATUS:NEEDS-ACTION
PRIORITY:5
LAST-MODIFIED:20250101T120000Z
END:VTODO
END:VCALENDAR`;
  }

  fetchCalendars(): DAVCalendar[] {
    return Array.from(this.calendars.values());
  }

  fetchCalendarObjects(calendarUrl: string): DAVCalendarObject[] {
    return this.objects.get(calendarUrl) || [];
  }

  createCalendarObject(calendarUrl: string, data: string): { ok: boolean; status: number } {
    const objects = this.objects.get(calendarUrl) || [];
    const object: DAVCalendarObject = {
      url: `${calendarUrl}obj-${this.objectCounter++}.ics`,
      data,
      etag: `"etag-${Date.now()}-${Math.random()}"`,
    };
    objects.push(object);
    this.objects.set(calendarUrl, objects);
    return { ok: true, status: 201 };
  }

  makeCalendar(url: string, displayName: string): void {
    this.addCalendar(displayName, url);
  }

  getObjectCount(calendarUrl: string): number {
    return (this.objects.get(calendarUrl) || []).length;
  }

  getTotalObjectCount(): number {
    let total = 0;
    for (const objects of this.objects.values()) {
      total += objects.length;
    }
    return total;
  }

  getEventCount(calendarUrl: string): number {
    const objects = this.objects.get(calendarUrl) || [];
    return objects.filter(obj => obj.data.includes('BEGIN:VEVENT')).length;
  }

  getTaskCount(calendarUrl: string): number {
    const objects = this.objects.get(calendarUrl) || [];
    return objects.filter(obj => obj.data.includes('BEGIN:VTODO')).length;
  }
}

// ===== Mock DAVClient Factory =====
function createMockCalDAVClient(server: MockCalDAVServer): any {
  return {
    login: jest.fn().mockResolvedValue(undefined),
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
describe('VTODO (Task) Migration Integration Tests', () => {
  let sourceServer: MockCalDAVServer;
  let targetServer: MockCalDAVServer;
  let config: MigrationConfig;
  let stateFilePath: string;

  beforeEach(() => {
    // Create fresh mock servers
    sourceServer = new MockCalDAVServer();
    targetServer = new MockCalDAVServer();

    // Create temporary state file path
    stateFilePath = path.join(__dirname, `test-vtodo-state-${Date.now()}.json`);

    // Store servers in closure
    const currentSourceServer = sourceServer;
    const currentTargetServer = targetServer;

    // Mock ProviderFactory to return our mock clients
    jest.spyOn(ProviderFactory, 'createClient').mockImplementation(async (providerConfig) => {
      if (providerConfig.provider === 'google') {
        return createMockCalDAVClient(currentSourceServer) as any;
      } else {
        return createMockCalDAVClient(currentTargetServer) as any;
      }
    });

    // Default config (calendar migration)
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

  // ===== TEST 1: Task-Only Calendar =====
  test('1. Task-only calendar: Migrate 10 tasks (no events)', async () => {
    // Setup: Calendar with only tasks
    const sourceCal = sourceServer.addCalendar('Tasks', 'https://mock-source.com/tasks/');
    for (let i = 1; i <= 10; i++) {
      sourceServer.addTask(sourceCal.url, `task-uid-${i}@example.com`, `Task ${i}`);
    }

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: 10 tasks migrated
    expect(targetServer.getTotalObjectCount()).toBe(10);

    // Verify: State tracks correct object types
    const state = stateManager.getState();
    expect(state.calendars[0].objectCounts?.VTODO).toBe(10);
    expect(state.calendars[0].objectCounts?.VEVENT).toBe(0);
    expect(state.calendars[0].migratedUIDs.length).toBe(10);
  }, 30000);

  // ===== TEST 2: Mixed Calendar (Events + Tasks) =====
  test('2. Mixed calendar: Migrate 5 events + 3 tasks', async () => {
    // Setup: Calendar with both events and tasks
    const sourceCal = sourceServer.addCalendar('Work', 'https://mock-source.com/work/');

    // Add 5 events
    for (let i = 1; i <= 5; i++) {
      sourceServer.addEvent(sourceCal.url, `event-uid-${i}@example.com`, `Event ${i}`);
    }

    // Add 3 tasks
    for (let i = 1; i <= 3; i++) {
      sourceServer.addTask(sourceCal.url, `task-uid-${i}@example.com`, `Task ${i}`);
    }

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: Total 8 objects migrated
    expect(targetServer.getTotalObjectCount()).toBe(8);

    // Verify: State tracks correct counts
    const state = stateManager.getState();
    expect(state.calendars[0].objectCounts?.VEVENT).toBe(5);
    expect(state.calendars[0].objectCounts?.VTODO).toBe(3);
    expect(state.calendars[0].migratedUIDs.length).toBe(8);
    expect(state.status).toBe('completed');
  }, 30000);

  // ===== TEST 3: Multiple Calendars with Different Object Types =====
  test('3. Multiple calendars: Events-only, tasks-only, and mixed', async () => {
    // Calendar 1: Events only
    const eventsCal = sourceServer.addCalendar('Events', 'https://mock-source.com/events/');
    for (let i = 1; i <= 4; i++) {
      sourceServer.addEvent(eventsCal.url, `event-${i}@example.com`, `Event ${i}`);
    }

    // Calendar 2: Tasks only
    const tasksCal = sourceServer.addCalendar('Tasks', 'https://mock-source.com/tasks/');
    for (let i = 1; i <= 6; i++) {
      sourceServer.addTask(tasksCal.url, `task-${i}@example.com`, `Task ${i}`);
    }

    // Calendar 3: Mixed
    const mixedCal = sourceServer.addCalendar('Mixed', 'https://mock-source.com/mixed/');
    sourceServer.addEvent(mixedCal.url, 'mixed-event-1@example.com', 'Mixed Event 1');
    sourceServer.addEvent(mixedCal.url, 'mixed-event-2@example.com', 'Mixed Event 2');
    sourceServer.addTask(mixedCal.url, 'mixed-task-1@example.com', 'Mixed Task 1');

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: Total 13 objects (4 events + 6 tasks + 2 events + 1 task)
    expect(targetServer.getTotalObjectCount()).toBe(13);

    // Verify: State shows 3 calendars
    const state = stateManager.getState();
    expect(state.calendars.length).toBe(3);

    // Find each calendar in state
    const eventsState = state.calendars.find(c => c.sourceCalendarName === 'Events');
    const tasksState = state.calendars.find(c => c.sourceCalendarName === 'Tasks');
    const mixedState = state.calendars.find(c => c.sourceCalendarName === 'Mixed');

    // Verify Events calendar (events only)
    expect(eventsState?.objectCounts?.VEVENT).toBe(4);
    expect(eventsState?.objectCounts?.VTODO).toBe(0);

    // Verify Tasks calendar (tasks only)
    expect(tasksState?.objectCounts?.VEVENT).toBe(0);
    expect(tasksState?.objectCounts?.VTODO).toBe(6);

    // Verify Mixed calendar
    expect(mixedState?.objectCounts?.VEVENT).toBe(2);
    expect(mixedState?.objectCounts?.VTODO).toBe(1);
  }, 30000);

  // ===== TEST 4: Object Type Detection Accuracy =====
  test('4. Object type detection: Correctly identifies VEVENT vs VTODO', async () => {
    // Setup: Calendar with clear distinction between events and tasks
    const sourceCal = sourceServer.addCalendar('Test', 'https://mock-source.com/test/');

    // Add distinct events
    sourceServer.addEvent(sourceCal.url, 'event-1@example.com', 'Meeting');
    sourceServer.addEvent(sourceCal.url, 'event-2@example.com', 'Conference');

    // Add distinct tasks
    sourceServer.addTask(sourceCal.url, 'task-1@example.com', 'Buy groceries');
    sourceServer.addTask(sourceCal.url, 'task-2@example.com', 'Submit report');
    sourceServer.addTask(sourceCal.url, 'task-3@example.com', 'Call client');

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: State correctly identifies object types
    const state = stateManager.getState();
    expect(state.calendars[0].objectCounts?.VEVENT).toBe(2);
    expect(state.calendars[0].objectCounts?.VTODO).toBe(3);
    expect(state.calendars[0].totalEvents).toBe(5); // Total objects
    expect(state.calendars[0].migratedUIDs.length).toBe(5);

    // Verify: All UIDs are accounted for
    const migratedUIDs = state.calendars[0].migratedUIDs;
    expect(migratedUIDs).toContain('event-1@example.com');
    expect(migratedUIDs).toContain('event-2@example.com');
    expect(migratedUIDs).toContain('task-1@example.com');
    expect(migratedUIDs).toContain('task-2@example.com');
    expect(migratedUIDs).toContain('task-3@example.com');
  }, 30000);

  // ===== TEST 5: Empty Calendar Handling =====
  test('5. Empty calendar: No objects to migrate', async () => {
    // Setup: Empty calendar
    sourceServer.addCalendar('Empty', 'https://mock-source.com/empty/');

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: No objects migrated
    expect(targetServer.getTotalObjectCount()).toBe(0);

    // Verify: Migration completed successfully
    const state = stateManager.getState();
    expect(state.status).toBe('completed');
  }, 30000);

  // ===== TEST 6: Large Task Collection =====
  test('6. Large task collection: 50 tasks migrated successfully', async () => {
    // Setup: Calendar with many tasks
    const sourceCal = sourceServer.addCalendar('Big Tasks', 'https://mock-source.com/bigtasks/');
    for (let i = 1; i <= 50; i++) {
      sourceServer.addTask(sourceCal.url, `task-${i}@example.com`, `Task ${i}`);
    }

    // Run migration
    const stateManager = new StateManager(stateFilePath, true);
    const engine = new MigrationEngine(config, stateManager);
    await engine.initialize();
    await engine.migrate();

    // Verify: All 50 tasks migrated
    expect(targetServer.getTotalObjectCount()).toBe(50);

    // Verify: State tracks all UIDs
    const state = stateManager.getState();
    expect(state.calendars[0].objectCounts?.VTODO).toBe(50);
    expect(state.calendars[0].migratedUIDs.length).toBe(50);
    expect(state.status).toBe('completed');
  }, 30000);
});
