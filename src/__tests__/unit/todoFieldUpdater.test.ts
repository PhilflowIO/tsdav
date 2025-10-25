/**
 * Unit tests for VTODO Field Updater
 *
 * Tests field-based updates for VTODO components without manual iCal string generation.
 */

import { DAVCalendarObject } from '../../types/models';
import {
  batchUpdateTodoFields,
  extractTodoFields,
  isTodoObject,
  updateTodoFields,
} from '../../util/todoFieldUpdater';

/**
 * Helper to create a minimal VTODO object for testing
 */
function createTestTodo(overrides?: Partial<string>): DAVCalendarObject {
  const icalString = overrides
    ? (overrides as unknown as string)
    : `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:test-todo-123@example.com
DTSTAMP:20250101T120000Z
SEQUENCE:0
SUMMARY:Test Todo
DESCRIPTION:Test description
STATUS:NEEDS-ACTION
PRIORITY:5
END:VTODO
END:VCALENDAR
`;

  return {
    data: icalString,
    etag: 'test-etag',
    url: 'https://example.com/todos/test.ics',
  };
}

describe('updateTodoFields', () => {
  describe('Basic field updates', () => {
    test('should update SUMMARY field', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Updated Todo Title' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('SUMMARY:Updated Todo Title');
      expect(result.data).not.toContain('SUMMARY:Test Todo');
    });

    test('should update DESCRIPTION field', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { DESCRIPTION: 'Updated detailed description' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('DESCRIPTION:Updated detailed description');
      expect(result.data).not.toContain('DESCRIPTION:Test description');
    });

    test('should update multiple fields at once', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        {
          SUMMARY: 'New Summary',
          DESCRIPTION: 'New Description',
        },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('SUMMARY:New Summary');
      expect(result.data).toContain('DESCRIPTION:New Description');
    });

    test('should handle empty SUMMARY update (remove property)', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: '' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).not.toContain('SUMMARY:');
    });

    test('should handle null DESCRIPTION update (remove property)', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { DESCRIPTION: null as unknown as string },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).not.toContain('DESCRIPTION:');
    });

    test('should not modify if fields are unchanged', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Test Todo' }, // Same as original
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(false);
    });

    test('should add SUMMARY if not present', () => {
      const todoWithoutSummary = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:test-todo-456@example.com
DTSTAMP:20250101T120000Z
DESCRIPTION:Todo without summary
END:VTODO
END:VCALENDAR
`);

      const result = updateTodoFields(
        todoWithoutSummary,
        { SUMMARY: 'New Summary' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('SUMMARY:New Summary');
    });
  });

  describe('SEQUENCE auto-increment', () => {
    test('should auto-increment SEQUENCE when field is modified (default)', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(todo, { SUMMARY: 'Updated' });

      expect(result.modified).toBe(true);
      expect(result.metadata?.sequence).toBe(1);
      expect(result.data).toContain('SEQUENCE:1');
    });

    test('should not increment SEQUENCE when autoIncrementSequence is false', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Updated' },
        { autoIncrementSequence: false }
      );

      expect(result.modified).toBe(true);
      expect(result.metadata?.sequence).toBeUndefined();
      expect(result.data).toContain('SEQUENCE:0');
    });

    test('should not increment SEQUENCE when no fields are modified', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Test Todo' }, // Same value
        { autoIncrementSequence: true }
      );

      expect(result.modified).toBe(false);
      expect(result.metadata?.sequence).toBeUndefined();
      expect(result.data).toContain('SEQUENCE:0');
    });

    test('should add SEQUENCE:0 if not present and then increment', () => {
      const todoWithoutSequence = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:test-todo-789@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Todo without sequence
END:VTODO
END:VCALENDAR
`);

      const result = updateTodoFields(
        todoWithoutSequence,
        { SUMMARY: 'Updated' },
        { autoIncrementSequence: true, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.metadata?.sequence).toBe(0);
      expect(result.data).toContain('SEQUENCE:0');
    });

    test('should increment existing SEQUENCE correctly', () => {
      const todoWithSequence5 = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:test-todo-seq@example.com
DTSTAMP:20250101T120000Z
SEQUENCE:5
SUMMARY:Todo with sequence 5
END:VTODO
END:VCALENDAR
`);

      const result = updateTodoFields(
        todoWithSequence5,
        { SUMMARY: 'Updated' },
        { autoIncrementSequence: true, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.metadata?.sequence).toBe(6);
      expect(result.data).toContain('SEQUENCE:6');
    });
  });

  describe('DTSTAMP auto-update', () => {
    test('should auto-update DTSTAMP when field is modified (default)', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(todo, { SUMMARY: 'Updated' });

      expect(result.modified).toBe(true);
      expect(result.metadata?.dtstamp).toBeDefined();
      expect(result.metadata?.dtstamp).not.toBe('20250101T120000Z');
      expect(result.data).toContain('DTSTAMP:');
    });

    test('should not update DTSTAMP when autoUpdateDtstamp is false', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Updated' },
        { autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.metadata?.dtstamp).toBeUndefined();
      expect(result.data).toContain('DTSTAMP:20250101T120000Z');
    });

    test('should not update DTSTAMP when no fields are modified', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Test Todo' }, // Same value
        { autoUpdateDtstamp: true }
      );

      expect(result.modified).toBe(false);
      expect(result.metadata?.dtstamp).toBeUndefined();
      expect(result.data).toContain('DTSTAMP:20250101T120000Z');
    });
  });

  describe('UID immutability', () => {
    test('should preserve UID during updates', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(todo, { SUMMARY: 'Updated' });

      expect(result.data).toContain('UID:test-todo-123@example.com');
    });

    test('should throw error if UID is missing', () => {
      const todoWithoutUid = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
DTSTAMP:20250101T120000Z
SUMMARY:Todo without UID
END:VTODO
END:VCALENDAR
`);

      expect(() => {
        updateTodoFields(todoWithoutUid, { SUMMARY: 'Updated' });
      }).toThrow('UID property is required');
    });
  });

  describe('VCALENDAR wrapper preservation', () => {
    test('should preserve VCALENDAR wrapper', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(todo, { SUMMARY: 'Updated' });

      expect(result.data).toContain('BEGIN:VCALENDAR');
      expect(result.data).toContain('END:VCALENDAR');
      expect(result.data).toContain('VERSION:2.0');
      expect(result.data).toContain('PRODID:');
    });

    test('should preserve BEGIN/END VTODO structure', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(todo, { SUMMARY: 'Updated' });

      expect(result.data).toContain('BEGIN:VTODO');
      expect(result.data).toContain('END:VTODO');
    });

    test('should throw error for nested VCALENDAR structure (non-standard)', () => {
      const nestedTodo = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VTODO
UID:nested-todo@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Nested todo
END:VTODO
END:VCALENDAR
END:VCALENDAR
`);

      // Nested VCALENDAR is not standard - should fail
      expect(() => {
        updateTodoFields(
          nestedTodo,
          { SUMMARY: 'Updated nested' },
          { autoIncrementSequence: false, autoUpdateDtstamp: false }
        );
      }).toThrow('VTODO component not found');
    });
  });

  describe('Vendor property preservation', () => {
    test('should preserve X-* vendor properties by default', () => {
      const todoWithVendorProps = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:vendor-todo@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Todo with vendor props
X-APPLE-SORT-ORDER:10
X-GOOGLE-CALENDAR-ID:abc123
X-CUSTOM-FIELD:custom-value
END:VTODO
END:VCALENDAR
`);

      const result = updateTodoFields(
        todoWithVendorProps,
        { SUMMARY: 'Updated' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('X-APPLE-SORT-ORDER:10');
      expect(result.data).toContain('X-GOOGLE-CALENDAR-ID:abc123');
      expect(result.data).toContain('X-CUSTOM-FIELD:custom-value');
      expect(result.metadata?.vendorExtensionsCount).toBe(3);
      expect(result.warnings).toContain('Preserved 3 vendor extension(s)');
    });

    test('should not preserve vendor properties when disabled', () => {
      const todoWithVendorProps = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:vendor-todo-2@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Todo with vendor props
X-APPLE-SORT-ORDER:10
END:VTODO
END:VCALENDAR
`);

      const result = updateTodoFields(
        todoWithVendorProps,
        { SUMMARY: 'Updated' },
        {
          autoIncrementSequence: false,
          autoUpdateDtstamp: false,
          preserveVendorExtensions: false,
        }
      );

      expect(result.modified).toBe(true);
      expect(result.metadata?.vendorExtensionsCount).toBeUndefined();
    });
  });

  describe('Line folding for long values', () => {
    test('should handle long SUMMARY (line folding)', () => {
      const longSummary =
        'This is a very long todo summary that exceeds 75 characters and should be folded according to RFC 5545 specifications for proper iCal formatting';

      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: longSummary },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('SUMMARY:');
      // Should contain the full text (may be folded with \r\n and space)
      const unfoldedData = result.data.replace(/\r\n /g, '');
      expect(unfoldedData).toContain(longSummary);
    });

    test('should handle long DESCRIPTION (line folding)', () => {
      const longDescription =
        'This is a very long detailed description for a todo item that contains multiple sentences and exceeds the 75 character line length limit specified in RFC 5545. It should be properly folded with CRLF followed by a space character to indicate continuation lines.';

      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { DESCRIPTION: longDescription },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('DESCRIPTION:');
      // Unfold and verify content
      const unfoldedData = result.data.replace(/\r\n /g, '');
      expect(unfoldedData).toContain(longDescription);
    });

    test('should handle multiline DESCRIPTION with newlines', () => {
      const multilineDescription = 'Line 1\nLine 2\nLine 3';

      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { DESCRIPTION: multilineDescription },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('DESCRIPTION:');
      // iCal should escape newlines as \n
      expect(result.data).toContain('DESCRIPTION:Line 1\\nLine 2\\nLine 3');
    });
  });

  describe('Config options', () => {
    test('should use default config when not provided', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(todo, { SUMMARY: 'Updated' });

      expect(result.modified).toBe(true);
      expect(result.metadata?.sequence).toBeDefined(); // Auto-increment enabled
      expect(result.metadata?.dtstamp).toBeDefined(); // Auto-update enabled
    });

    test('should respect all config options', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Updated' },
        {
          autoIncrementSequence: false,
          autoUpdateDtstamp: false,
          preserveUnknownFields: true,
          preserveVendorExtensions: true,
        }
      );

      expect(result.modified).toBe(true);
      expect(result.metadata?.sequence).toBeUndefined();
      expect(result.metadata?.dtstamp).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    test('should throw error if calendarObject.data is missing', () => {
      const invalidTodo = {
        etag: 'test-etag',
        url: 'https://example.com/todos/test.ics',
      } as DAVCalendarObject;

      expect(() => {
        updateTodoFields(invalidTodo, { SUMMARY: 'Updated' });
      }).toThrow('calendarObject.data is required');
    });

    test('should throw error if calendarObject.data is not a string', () => {
      const invalidTodo = {
        data: { invalid: 'object' },
        etag: 'test-etag',
        url: 'https://example.com/todos/test.ics',
      } as unknown as DAVCalendarObject;

      expect(() => {
        updateTodoFields(invalidTodo, { SUMMARY: 'Updated' });
      }).toThrow('calendarObject.data must be a string');
    });

    test('should throw error if VTODO component not found', () => {
      const eventInsteadOfTodo = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-event@example.com
DTSTAMP:20250101T120000Z
SUMMARY:This is an event, not a todo
END:VEVENT
END:VCALENDAR
`);

      expect(() => {
        updateTodoFields(eventInsteadOfTodo, { SUMMARY: 'Updated' });
      }).toThrow('VTODO component not found');
    });

    test('should throw error for invalid iCal format', () => {
      const invalidIcal = createTestTodo('INVALID ICAL DATA');

      expect(() => {
        updateTodoFields(invalidIcal, { SUMMARY: 'Updated' });
      }).toThrow('Failed to parse iCal component');
    });
  });

  describe('Other standard VTODO fields preserved', () => {
    test('should preserve STATUS field', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Updated' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.data).toContain('STATUS:NEEDS-ACTION');
    });

    test('should preserve PRIORITY field', () => {
      const todo = createTestTodo();
      const result = updateTodoFields(
        todo,
        { SUMMARY: 'Updated' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.data).toContain('PRIORITY:5');
    });

    test('should preserve all unmodified fields', () => {
      const todoWithManyFields = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:complex-todo@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Complex Todo
DESCRIPTION:Original description
STATUS:IN-PROCESS
PRIORITY:1
PERCENT-COMPLETE:50
DUE:20250115T120000Z
CATEGORIES:work,urgent
END:VTODO
END:VCALENDAR
`);

      const result = updateTodoFields(
        todoWithManyFields,
        { SUMMARY: 'Updated Complex Todo' },
        { autoIncrementSequence: false, autoUpdateDtstamp: false }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('SUMMARY:Updated Complex Todo');
      expect(result.data).toContain('DESCRIPTION:Original description');
      expect(result.data).toContain('STATUS:IN-PROCESS');
      expect(result.data).toContain('PRIORITY:1');
      expect(result.data).toContain('PERCENT-COMPLETE:50');
      expect(result.data).toContain('DUE:20250115T120000Z');
      expect(result.data).toContain('CATEGORIES:work,urgent');
    });
  });
});

describe('batchUpdateTodoFields', () => {
  test('should update multiple todos with same fields', () => {
    const todos = [createTestTodo(), createTestTodo(), createTestTodo()];

    const results = batchUpdateTodoFields(
      todos,
      { SUMMARY: 'Batch Updated' },
      { autoIncrementSequence: false, autoUpdateDtstamp: false }
    );

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result.modified).toBe(true);
      expect(result.data).toContain('SUMMARY:Batch Updated');
    });
  });

  test('should handle empty array', () => {
    const results = batchUpdateTodoFields([], { SUMMARY: 'Updated' });

    expect(results).toHaveLength(0);
  });

  test('should handle mixed success/failure', () => {
    const todos = [
      createTestTodo(),
      createTestTodo('INVALID ICAL'),
      createTestTodo(),
    ];

    expect(() => {
      batchUpdateTodoFields(todos, { SUMMARY: 'Updated' });
    }).toThrow();
  });
});

describe('isTodoObject', () => {
  test('should return true for valid VTODO object', () => {
    const todo = createTestTodo();
    expect(isTodoObject(todo)).toBe(true);
  });

  test('should return false for VEVENT object', () => {
    const event = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-event@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Event
END:VEVENT
END:VCALENDAR
`);

    expect(isTodoObject(event)).toBe(false);
  });

  test('should return false for invalid data', () => {
    const invalid = {
      data: 'INVALID',
      etag: 'test',
      url: 'https://example.com/test.ics',
    };

    expect(isTodoObject(invalid)).toBe(false);
  });

  test('should return false for missing data', () => {
    const missing = {
      etag: 'test',
      url: 'https://example.com/test.ics',
    } as DAVCalendarObject;

    expect(isTodoObject(missing)).toBe(false);
  });

  test('should return false for non-string data', () => {
    const invalid = {
      data: { invalid: 'object' },
      etag: 'test',
      url: 'https://example.com/test.ics',
    } as unknown as DAVCalendarObject;

    expect(isTodoObject(invalid)).toBe(false);
  });
});

describe('extractTodoFields', () => {
  test('should extract SUMMARY and DESCRIPTION', () => {
    const todo = createTestTodo();
    const fields = extractTodoFields(todo);

    expect(fields.SUMMARY).toBe('Test Todo');
    expect(fields.DESCRIPTION).toBe('Test description');
  });

  test('should extract only present fields', () => {
    const todoWithoutDescription = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:test-todo@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Only summary
END:VTODO
END:VCALENDAR
`);

    const fields = extractTodoFields(todoWithoutDescription);

    expect(fields.SUMMARY).toBe('Only summary');
    expect(fields.DESCRIPTION).toBeUndefined();
  });

  test('should return empty object if no supported fields present', () => {
    const minimalTodo = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VTODO
UID:minimal-todo@example.com
DTSTAMP:20250101T120000Z
END:VTODO
END:VCALENDAR
`);

    const fields = extractTodoFields(minimalTodo);

    expect(fields.SUMMARY).toBeUndefined();
    expect(fields.DESCRIPTION).toBeUndefined();
  });

  test('should throw error if VTODO not found', () => {
    const event = createTestTodo(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:event@example.com
DTSTAMP:20250101T120000Z
SUMMARY:Event
END:VEVENT
END:VCALENDAR
`);

    expect(() => {
      extractTodoFields(event);
    }).toThrow('VTODO component not found');
  });

  test('should throw error for invalid data', () => {
    const invalid = {
      data: null,
      etag: 'test',
      url: 'https://example.com/test.ics',
    } as unknown as DAVCalendarObject;

    expect(() => {
      extractTodoFields(invalid);
    }).toThrow('calendarObject.data must be a string');
  });
});
