/**
 * Field-Based Update Types for tsdav
 *
 * These types support field-level updates for CalDAV, CardDAV, and VTODO objects
 * without requiring manual iCal/vCard string generation.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545 - iCalendar (VEVENT, VTODO)
 * @see https://datatracker.ietf.org/doc/html/rfc6350 - vCard
 */

/**
 * Base configuration for field updaters
 *
 * Controls automatic behavior when updating fields
 */
export interface BaseFieldUpdaterConfig {
  /**
   * Auto-increment SEQUENCE property (RFC 5545 Section 3.8.7.4)
   *
   * SEQUENCE indicates the revision sequence number of the calendar component.
   * It MUST be incremented each time the event is modified.
   *
   * @default true
   */
  autoIncrementSequence?: boolean;

  /**
   * Auto-update DTSTAMP property (RFC 5545 Section 3.8.7.2)
   *
   * DTSTAMP indicates the date/time the instance of the iCalendar object was created.
   * It SHOULD be updated each time the event is modified.
   *
   * @default true
   */
  autoUpdateDtstamp?: boolean;

  /**
   * Preserve fields not explicitly updated
   *
   * When true, fields not mentioned in the update will be preserved from the original object.
   * When false, only specified fields will be present in the result.
   *
   * @default true
   */
  preserveUnknownFields?: boolean;

  /**
   * Preserve vendor-specific extensions (X-* properties)
   *
   * Many CalDAV servers add custom properties like X-APPLE-SORT-ORDER, X-GOOGLE-*.
   * When true, these will be preserved during updates.
   *
   * @default true
   */
  preserveVendorExtensions?: boolean;
}

/**
 * Result of a field update operation
 *
 * Contains the updated data string and metadata about the operation
 */
export interface FieldUpdateResult {
  /**
   * Updated iCal/vCard string
   *
   * This string can be passed directly to updateCalendarObject/updateVCard/updateTodo
   */
  data: string;

  /**
   * Whether any fields were actually modified
   *
   * False if all provided field values matched existing values
   */
  modified: boolean;

  /**
   * Optional warnings encountered during update
   *
   * Examples:
   * - "SEQUENCE already at value X, not incremented"
   * - "VTIMEZONE component not found"
   * - "Unknown property X-CUSTOM preserved"
   */
  warnings?: string[];

  /**
   * Metadata about the update
   */
  metadata?: {
    /**
     * New SEQUENCE value (if auto-incremented)
     */
    sequence?: number;

    /**
     * New DTSTAMP value (if auto-updated)
     *
     * ISO 8601 format: YYYYMMDDTHHMMSSZ
     */
    dtstamp?: string;

    /**
     * Number of vendor extensions preserved
     */
    vendorExtensionsCount?: number;
  };
}

/**
 * vCard field update options (RFC 6350)
 *
 * Supported fields for CardDAV vCard updates
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6350
 */
export interface VCardFields {
  /**
   * FN - Formatted Name (required in vCard 3.0/4.0)
   *
   * The formatted text corresponding to the name of the object.
   *
   * Example: "Dr. John Q. Public, Esq."
   */
  FN?: string;

  /**
   * N - Structured Name
   *
   * Format: Family;Given;Additional;Prefix;Suffix
   *
   * Example: "Public;John;Quinlan;Mr.;Esq."
   */
  N?: string;

  /**
   * EMAIL - Email Address
   *
   * Example: "john@example.com"
   */
  EMAIL?: string;

  /**
   * TEL - Telephone Number
   *
   * Example: "+1-555-555-5555"
   */
  TEL?: string;

  /**
   * ORG - Organization
   *
   * Example: "ABC Inc."
   */
  ORG?: string;

  /**
   * NOTE - Notes/Comments
   *
   * Example: "Met at conference 2024"
   */
  NOTE?: string;

  /**
   * TITLE - Job Title
   *
   * Example: "Software Engineer"
   */
  TITLE?: string;

  /**
   * URL - Web URL
   *
   * Example: "https://example.com"
   */
  URL?: string;
}

/**
 * Calendar Event (VEVENT) field update options (RFC 5545)
 *
 * Supported fields for CalDAV calendar event updates
 *
 * MVP: SUMMARY, DESCRIPTION
 * Future: DTSTART, DTEND, RRULE, LOCATION, etc.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.1
 */
export interface EventFields {
  /**
   * SUMMARY - Brief description/title
   *
   * A short summary or subject for the calendar component.
   *
   * Example: "Team Meeting"
   */
  SUMMARY?: string;

  /**
   * DESCRIPTION - Detailed description
   *
   * A more complete description of the calendar component.
   *
   * Example: "Quarterly team meeting to discuss Q1 objectives"
   */
  DESCRIPTION?: string;

  /**
   * LOCATION - Location (future)
   *
   * Example: "Conference Room A"
   */
  // LOCATION?: string;

  /**
   * DTSTART - Start DateTime (future)
   *
   * Format: YYYYMMDDTHHMMSSZ or YYYYMMDD (all-day)
   *
   * Example: "20250115T100000Z"
   */
  // DTSTART?: string;

  /**
   * DTEND - End DateTime (future)
   *
   * Format: YYYYMMDDTHHMMSSZ or YYYYMMDD (all-day)
   *
   * Example: "20250115T110000Z"
   */
  // DTEND?: string;

  /**
   * RRULE - Recurrence Rule (future)
   *
   * Example: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
   */
  // RRULE?: string;
}

/**
 * Todo (VTODO) field update options (RFC 5545)
 *
 * Supported fields for CalDAV todo updates
 *
 * MVP: SUMMARY, DESCRIPTION
 * Future: DUE, STATUS, PRIORITY, PERCENT-COMPLETE
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.2
 */
export interface TodoFields {
  /**
   * SUMMARY - Brief description/title
   *
   * Example: "Fix login bug"
   */
  SUMMARY?: string;

  /**
   * DESCRIPTION - Detailed description
   *
   * Example: "Users cannot login with special characters in password"
   */
  DESCRIPTION?: string;

  /**
   * STATUS - Todo status (future)
   *
   * Values: NEEDS-ACTION | IN-PROCESS | COMPLETED | CANCELLED
   */
  // STATUS?: 'NEEDS-ACTION' | 'IN-PROCESS' | 'COMPLETED' | 'CANCELLED';

  /**
   * PRIORITY - Priority level (future)
   *
   * 0 = undefined, 1 = highest, 9 = lowest
   */
  // PRIORITY?: number;

  /**
   * PERCENT-COMPLETE - Completion percentage (future)
   *
   * Integer 0-100
   */
  // PERCENT_COMPLETE?: number;

  /**
   * DUE - Due Date (future)
   *
   * Format: YYYYMMDDTHHMMSSZ
   */
  // DUE?: string;
}
