/**
 * Unit tests for MigrationEngine
 * Focus: getDisplayName() method with Baikal URL fallback (Issue #22)
 */

import { MigrationEngine } from '../src/core/MigrationEngine';
import { StateManager } from '../src/core/StateManager';
import { DAVCalendar } from 'tsdav';

// Mock the configuration
const mockConfig = {
  source: {
    provider: 'baikal' as const,
    serverUrl: 'https://example.com/dav.php',
    authMethod: 'Basic' as const,
    credentials: {
      username: 'test',
      password: 'test',
    },
  },
  target: {
    provider: 'google' as const,
    serverUrl: 'https://apidata.googleusercontent.com/caldav/v2/',
    authMethod: 'Oauth' as const,
    credentials: {
      username: 'test@example.com',
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      refreshToken: 'test-token',
    },
  },
  options: {
    overwrite: false,
  },
};

describe('MigrationEngine', () => {
  describe('getDisplayName', () => {
    let engine: MigrationEngine;
    let mockStateManager: StateManager;

    beforeEach(() => {
      // Create a minimal mock StateManager
      mockStateManager = {
        initializeMigration: jest.fn(),
        updateCalendarStatus: jest.fn(),
        recordEventMigration: jest.fn(),
        markMigrationComplete: jest.fn(),
        loadFromFile: jest.fn(),
      } as any;

      engine = new MigrationEngine(mockConfig, mockStateManager);
    });

    it('should return string displayName when provided', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/test/',
        displayName: 'My Calendar',
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('My Calendar');
    });

    it('should extract displayName from URL when displayName is empty object (Baikal)', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://baikal.example.com/dav.php/calendars/tester/project-luna/',
        displayName: {} as any, // Baikal returns empty object
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Project Luna');
    });

    it('should extract displayName from URL with hyphens (Baikal)', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://baikal.example.com/dav.php/calendars/tester/work-projects/',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Work Projects');
    });

    it('should extract displayName from URL with underscores', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/my_personal_calendar/',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('My Personal Calendar');
    });

    it('should handle URL without trailing slash', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/project-alpha',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Project Alpha');
    });

    it('should decode URL-encoded calendar names', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/Mein%20Kalender/',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Mein Kalender');
    });

    it('should skip technical URL segments like "calendars"', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/calendars-backup/',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      // Should extract "calendars-backup", not "calendars"
      expect(result).toBe('Calendars Backup');
    });

    it('should extract _text from object displayName', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/test/',
        displayName: { _text: 'Text Calendar' } as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Text Calendar');
    });

    it('should extract value from object displayName', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://example.com/dav.php/calendars/user/test/',
        displayName: { value: 'Value Calendar' } as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Value Calendar');
    });

    it('should fallback to default when no name can be extracted', () => {
      const calendar: Partial<DAVCalendar> = {
        url: undefined, // No URL
        displayName: {} as any, // Empty object
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Unnamed Calendar');
    });

    it('should use custom fallback name', () => {
      const calendar: Partial<DAVCalendar> = {
        url: undefined,
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar, 'Default Name');
      expect(result).toBe('Default Name');
    });

    it('should handle Nextcloud URLs correctly', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://nextcloud.example.com/remote.php/dav/calendars/alice/personal/',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Personal');
    });

    it('should handle complex Nextcloud URLs with multiple path segments', () => {
      const calendar: Partial<DAVCalendar> = {
        url: 'https://cloud.example.com/remote.php/dav/calendars/bob/work-team-calendar/',
        displayName: {} as any,
        components: ['VEVENT'],
      };

      const result = engine['getDisplayName'](calendar as DAVCalendar);
      expect(result).toBe('Work Team Calendar');
    });
  });
});
