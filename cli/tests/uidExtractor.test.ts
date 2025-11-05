/**
 * Unit Tests for UIDExtractor
 */

import { UIDExtractor } from '../src/utils/uidExtractor';

describe('UIDExtractor', () => {
  const sampleVEvent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-event-123@example.com
DTSTAMP:20240101T120000Z
DTSTART:20240115T100000Z
DTEND:20240115T110000Z
SUMMARY:Test Event
LAST-MODIFIED:20240101T120000Z
END:VEVENT
END:VCALENDAR`;

  const sampleVTodo = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:test-todo-456@example.com
DTSTAMP:20240101T120000Z
SUMMARY:Test Task
DUE:20240120T000000Z
STATUS:NEEDS-ACTION
END:VTODO
END:VCALENDAR`;

  const malformedIcal = `BEGIN:VCALENDAR
VERSION:2.0
INCOMPLETE DATA`;

  describe('extractUID', () => {
    it('should extract UID from VEVENT', () => {
      const uid = UIDExtractor.extractUID(sampleVEvent);
      expect(uid).toBe('test-event-123@example.com');
    });

    it('should extract UID from VTODO', () => {
      const uid = UIDExtractor.extractUID(sampleVTodo);
      expect(uid).toBe('test-todo-456@example.com');
    });

    it('should return null for malformed iCal data', () => {
      const uid = UIDExtractor.extractUID(malformedIcal);
      expect(uid).toBeNull();
    });

    it('should return null for empty string', () => {
      const uid = UIDExtractor.extractUID('');
      expect(uid).toBeNull();
    });
  });

  describe('extractUIDRegex', () => {
    it('should extract UID using regex fallback', () => {
      const uid = UIDExtractor.extractUIDRegex(sampleVEvent);
      expect(uid).toBe('test-event-123@example.com');
    });

    it('should return null if no UID found', () => {
      const uid = UIDExtractor.extractUIDRegex('no uid here');
      expect(uid).toBeNull();
    });
  });

  describe('extractUIDOrThrow', () => {
    it('should extract UID successfully', () => {
      const uid = UIDExtractor.extractUIDOrThrow(sampleVEvent);
      expect(uid).toBe('test-event-123@example.com');
    });

    it('should throw error if UID cannot be extracted', () => {
      expect(() => {
        UIDExtractor.extractUIDOrThrow(malformedIcal);
      }).toThrow('Failed to extract UID from iCalendar data');
    });
  });

  describe('validateICalendar', () => {
    it('should validate correct VEVENT iCal data', () => {
      const valid = UIDExtractor.validateICalendar(sampleVEvent);
      expect(valid).toBe(true);
    });

    it('should validate correct VTODO iCal data', () => {
      const valid = UIDExtractor.validateICalendar(sampleVTodo);
      expect(valid).toBe(true);
    });

    it('should return false for malformed iCal data', () => {
      const valid = UIDExtractor.validateICalendar(malformedIcal);
      expect(valid).toBe(false);
    });

    it('should return false for empty string', () => {
      const valid = UIDExtractor.validateICalendar('');
      expect(valid).toBe(false);
    });
  });

  describe('extractLastModified', () => {
    it('should extract LAST-MODIFIED timestamp', () => {
      const timestamp = UIDExtractor.extractLastModified(sampleVEvent);
      expect(timestamp).toBeTruthy();
      expect(typeof timestamp).toBe('string');
      // Should be ISO 8601 format
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return null for malformed data', () => {
      const timestamp = UIDExtractor.extractLastModified(malformedIcal);
      expect(timestamp).toBeNull();
    });
  });

  describe('extractSummaryForPreview', () => {
    it('should extract summary from VEVENT', () => {
      const summary = UIDExtractor.extractSummaryForPreview(sampleVEvent);
      expect(summary).toBe('Test Event');
    });

    it('should extract summary from VTODO', () => {
      const summary = UIDExtractor.extractSummaryForPreview(sampleVTodo);
      expect(summary).toBe('Test Task');
    });

    it('should return null for malformed data', () => {
      const summary = UIDExtractor.extractSummaryForPreview(malformedIcal);
      expect(summary).toBeNull();
    });
  });

  describe('generateFilename', () => {
    it('should generate safe filename from UID', () => {
      const filename = UIDExtractor.generateFilename('test-event-123@example.com');
      expect(filename).toBe('test-event-123_example.com');
    });

    it('should replace invalid characters', () => {
      const filename = UIDExtractor.generateFilename('test/event:123@example.com');
      expect(filename).toBe('test_event_123_example.com');
    });

    it('should preserve valid characters', () => {
      const filename = UIDExtractor.generateFilename('test-event_123.456');
      expect(filename).toBe('test-event_123.456');
    });
  });
});
