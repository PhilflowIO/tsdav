import ICAL from 'ical.js';
import {
  parseLine,
  foldLine,
  unfoldLines,
  parseICalComponent,
  serializeICalComponent,
  updateSequence,
  updateDtstamp,
  preserveVendorProperties,
  getSequence,
  getDtstamp,
  validateUid,
} from '../../util/fieldUpdater';

describe('fieldUpdater', () => {
  describe('parseLine', () => {
    test('should parse simple property line', () => {
      const result = parseLine('SUMMARY:Team Meeting');
      expect(result.key).toBe('SUMMARY');
      expect(result.value).toBe('Team Meeting');
      expect(result.params).toBeUndefined();
    });

    test('should parse property with single parameter', () => {
      const result = parseLine('DTSTART;TZID=America/New_York:20250115T100000');
      expect(result.key).toBe('DTSTART');
      expect(result.value).toBe('20250115T100000');
      expect(result.params).toEqual({ TZID: 'America/New_York' });
    });

    test('should parse property with multiple parameters', () => {
      const result = parseLine('ATTACH;FMTTYPE=image/jpeg;ENCODING=BASE64:...');
      expect(result.key).toBe('ATTACH');
      expect(result.value).toBe('...');
      expect(result.params).toEqual({
        FMTTYPE: 'image/jpeg',
        ENCODING: 'BASE64',
      });
    });

    test('should throw error for line without colon', () => {
      expect(() => parseLine('INVALID LINE')).toThrow('Invalid iCal/vCard line');
    });

    test('should handle empty value', () => {
      const result = parseLine('SUMMARY:');
      expect(result.key).toBe('SUMMARY');
      expect(result.value).toBe('');
    });
  });

  describe('foldLine', () => {
    test('should not fold short lines', () => {
      const line = 'SUMMARY:Short';
      expect(foldLine(line)).toBe(line);
    });

    test('should fold lines exceeding 75 characters', () => {
      const longLine =
        'DESCRIPTION:This is a very long description that definitely exceeds the seventy-five character limit';
      const folded = foldLine(longLine);

      // Should contain CRLF + space
      expect(folded).toContain('\r\n ');

      // Unfold should restore original
      const unfolded = unfoldLines(folded);
      expect(unfolded).toBe(longLine);
    });

    test('should respect custom max length', () => {
      const line = 'SUMMARY:This line is longer than 20 chars';
      const folded = foldLine(line, 20);

      expect(folded).toContain('\r\n ');
      expect(folded.split('\r\n')[0].length).toBe(20);
    });

    test('should handle very long lines with multiple folds', () => {
      const veryLongLine = 'X'.repeat(200);
      const folded = foldLine(veryLongLine);

      // Should have multiple folds
      const foldCount = (folded.match(/\r\n /g) || []).length;
      expect(foldCount).toBeGreaterThan(1);
    });
  });

  describe('unfoldLines', () => {
    test('should unfold CRLF + space', () => {
      const folded = 'DESCRIPTION:First\r\n Second\r\n Third';
      const unfolded = unfoldLines(folded);
      expect(unfolded).toBe('DESCRIPTION:FirstSecondThird');
    });

    test('should unfold LF + space (no CR)', () => {
      const folded = 'DESCRIPTION:First\n Second\n Third';
      const unfolded = unfoldLines(folded);
      expect(unfolded).toBe('DESCRIPTION:FirstSecondThird');
    });

    test('should not modify lines without folding', () => {
      const icalString = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR';
      expect(unfoldLines(icalString)).toBe(icalString);
    });
  });

  describe('parseICalComponent', () => {
    test('should parse valid VCALENDAR', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Test//Test//EN',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Test Event',
        'DTSTART:20250115T100000Z',
        'DTEND:20250115T110000Z',
        'DTSTAMP:20250101T120000Z',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      expect(component.name).toBe('vcalendar');

      const vevent = component.getFirstSubcomponent('vevent');
      expect(vevent).toBeTruthy();
      expect(vevent?.getFirstPropertyValue('summary')).toBe('Test Event');
    });

    test('should parse folded lines', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'DESCRIPTION:This is a very long description that has been folded',
        ' across multiple lines',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');
      const description = vevent?.getFirstPropertyValue('description');

      expect(description).toBe(
        'This is a very long description that has been foldedacross multiple lines'
      );
    });

    test('should throw error for invalid iCal', () => {
      expect(() => parseICalComponent('INVALID ICAL')).toThrow('Failed to parse iCal component');
    });
  });

  describe('serializeICalComponent', () => {
    test('should serialize component back to string', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Test//Test//EN',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const serialized = serializeICalComponent(component);

      expect(serialized).toContain('BEGIN:VCALENDAR');
      expect(serialized).toContain('SUMMARY:Test');
      expect(serialized).toContain('END:VCALENDAR');
    });

    test('should roundtrip parse and serialize', () => {
      const original = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Roundtrip Test',
        'DTSTART:20250115T100000Z',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(original);
      const serialized = serializeICalComponent(component);
      const reparsed = parseICalComponent(serialized);

      const vevent = reparsed.getFirstSubcomponent('vevent');
      expect(vevent?.getFirstPropertyValue('summary')).toBe('Roundtrip Test');
      expect(vevent?.getFirstPropertyValue('uid')).toBe('test-123');
    });
  });

  describe('updateSequence', () => {
    test('should increment existing SEQUENCE', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SEQUENCE:5',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        updateSequence(vevent);
        expect(vevent.getFirstPropertyValue('sequence')).toBe(6);
      }
    });

    test('should add SEQUENCE:0 if not present', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        updateSequence(vevent);
        expect(vevent.getFirstPropertyValue('sequence')).toBe(0);
      }
    });

    test('should handle multiple updates', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SEQUENCE:0',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        updateSequence(vevent);
        updateSequence(vevent);
        updateSequence(vevent);
        expect(vevent.getFirstPropertyValue('sequence')).toBe(3);
      }
    });
  });

  describe('updateDtstamp', () => {
    test('should update existing DTSTAMP to current time', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'DTSTAMP:20200101T120000Z',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        const oldDtstamp = vevent.getFirstPropertyValue('dtstamp');
        updateDtstamp(vevent);
        const newDtstamp = vevent.getFirstPropertyValue('dtstamp');

        expect(newDtstamp).not.toBe(oldDtstamp);
        // ICAL.Time object can be in ISO or iCal format, just check it's a valid timestamp
        expect(newDtstamp).toBeTruthy();
        if (newDtstamp) {
          expect(newDtstamp.toString()).toMatch(/^\d{4}/); // Starts with year
        }
      }
    });

    test('should add DTSTAMP if not present', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        updateDtstamp(vevent);
        const dtstamp = vevent.getFirstPropertyValue('dtstamp');

        expect(dtstamp).toBeTruthy();
        // Check it's a valid ICAL.Time object
        if (dtstamp) {
          expect(dtstamp.toString()).toMatch(/^\d{4}/); // Starts with year
        }
      }
    });
  });

  describe('preserveVendorProperties', () => {
    test('should copy X-* properties from original to updated', () => {
      const originalIcal = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Original',
        'X-APPLE-SORT-ORDER:10',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const updatedIcal = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SUMMARY:Updated',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const originalComponent = parseICalComponent(originalIcal);
      const updatedComponent = parseICalComponent(updatedIcal);

      const originalEvent = originalComponent.getFirstSubcomponent('vevent');
      const updatedEvent = updatedComponent.getFirstSubcomponent('vevent');

      if (originalEvent && updatedEvent) {
        // Count X-* properties before
        const xPropsBeforeCount = updatedEvent
          .getAllProperties()
          .filter((p) => p.name.toLowerCase().startsWith('x-')).length;

        preserveVendorProperties(updatedEvent, originalEvent);

        // Count X-* properties after
        const xPropsAfterCount = updatedEvent
          .getAllProperties()
          .filter((p) => p.name.toLowerCase().startsWith('x-')).length;

        // Should have more X-* properties after preserving
        expect(xPropsAfterCount).toBeGreaterThan(xPropsBeforeCount);

        // Check that the specific vendor property was copied
        const xAppleProp = updatedEvent.getFirstProperty('x-apple-sort-order');
        expect(xAppleProp).toBeTruthy();
      }
    });

    test('should not override existing X-* properties in updated', () => {
      const originalIcal = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'X-CUSTOM:old-value',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const updatedIcal = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'X-CUSTOM:new-value',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const originalComponent = parseICalComponent(originalIcal);
      const updatedComponent = parseICalComponent(updatedIcal);

      const originalEvent = originalComponent.getFirstSubcomponent('vevent');
      const updatedEvent = updatedComponent.getFirstSubcomponent('vevent');

      if (originalEvent && updatedEvent) {
        preserveVendorProperties(updatedEvent, originalEvent);

        // Should keep the new value, not overwrite
        expect(updatedEvent.getFirstPropertyValue('x-custom')).toBe('new-value');
      }
    });
  });

  describe('getSequence', () => {
    test('should return SEQUENCE value', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'SEQUENCE:5',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        expect(getSequence(vevent)).toBe(5);
      }
    });

    test('should return 0 if SEQUENCE not present', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        expect(getSequence(vevent)).toBe(0);
      }
    });
  });

  describe('getDtstamp', () => {
    test('should return DTSTAMP value as string', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'DTSTAMP:20250115T100000Z',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        const dtstamp = getDtstamp(vevent);
        expect(dtstamp).toBeTruthy();
        expect(dtstamp).toContain('20250115');
      }
    });

    test('should return null if DTSTAMP not present', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        expect(getDtstamp(vevent)).toBeNull();
      }
    });
  });

  describe('validateUid', () => {
    test('should not throw for component with UID', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:test-123',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        expect(() => validateUid(vevent)).not.toThrow();
      }
    });

    test('should throw for component without UID', () => {
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'SUMMARY:Test',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const component = parseICalComponent(ical);
      const vevent = component.getFirstSubcomponent('vevent');

      if (vevent) {
        expect(() => validateUid(vevent)).toThrow('UID property is required');
      }
    });
  });
});
