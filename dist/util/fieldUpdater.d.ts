/**
 * Shared Utilities for Field-Based Updates
 *
 * ⚠️ READ-ONLY DURING PHASE 2 PARALLEL DEVELOPMENT
 * All changes to this file must go through Orchestrator
 *
 * This module provides shared functions for parsing, manipulating, and serializing
 * iCal and vCard formats used by CalDAV and CardDAV.
 *
 * @see https://github.com/kewisch/ical.js
 */
import ICAL from 'ical.js';
/**
 * Parse result from line parsing
 */
export interface ParsedLine {
    /** Property name (e.g., "SUMMARY", "FN") */
    key: string;
    /** Property value */
    value: string;
    /** Optional parameters (e.g., CHARSET=UTF-8, ENCODING=BASE64) */
    params?: Record<string, string>;
}
/**
 * Parse a single iCal/vCard line into key, value, and parameters
 *
 * Handles RFC 5545/6350 property format:
 * - Simple: SUMMARY:Meeting
 * - With params: DTSTART;TZID=America/New_York:20250115T100000
 *
 * @param line - Single line from iCal/vCard (already unfolded)
 * @returns Parsed line components
 *
 * @example
 * ```ts
 * parseLine("SUMMARY:Team Meeting")
 * // => { key: "SUMMARY", value: "Team Meeting" }
 *
 * parseLine("DTSTART;TZID=America/New_York:20250115T100000")
 * // => { key: "DTSTART", value: "20250115T100000", params: { TZID: "America/New_York" } }
 * ```
 */
export declare function parseLine(line: string): ParsedLine;
/**
 * Fold a line to meet RFC 5545/6350 line length requirements
 *
 * RFC 5545 Section 3.1: Lines SHOULD NOT be longer than 75 octets.
 * Longer lines are "folded" by inserting CRLF followed by a single space.
 *
 * @param line - Line to fold
 * @param maxLength - Maximum line length before folding (default: 75)
 * @returns Folded line(s)
 *
 * @example
 * ```ts
 * foldLine("DESCRIPTION:This is a very long description that exceeds 75 characters and needs to be folded")
 * // => "DESCRIPTION:This is a very long description that exceeds 75 character\r\n s and needs to be folded"
 * ```
 */
export declare function foldLine(line: string, maxLength?: number): string;
/**
 * Unfold lines that were folded according to RFC 5545/6350
 *
 * Lines folded with CRLF + SPACE are unfolded by removing the CRLF and space.
 *
 * @param icalString - iCal/vCard string with potentially folded lines
 * @returns String with unfolded lines
 *
 * @example
 * ```ts
 * unfoldLines("DESCRIPTION:Long\r\n  line")
 * // => "DESCRIPTION:Long line"
 * ```
 */
export declare function unfoldLines(icalString: string): string;
/**
 * Parse an iCal string into an ICAL.Component
 *
 * Uses ical.js to parse the string into a structured component tree.
 *
 * @param icalString - iCal string (VCALENDAR, VEVENT, VTODO, or standalone VCARD)
 * @returns Parsed ICAL.Component
 * @throws Error if parsing fails
 *
 * @example
 * ```ts
 * const component = parseICalComponent(icalString);
 * const vevent = component.getFirstSubcomponent('vevent');
 * ```
 */
export declare function parseICalComponent(icalString: string): ICAL.Component;
/**
 * Serialize an ICAL.Component back to iCal string
 *
 * Converts the component tree back to RFC 5545/6350 format with proper line folding.
 *
 * @param component - ICAL.Component to serialize
 * @returns iCal string with folded lines
 *
 * @example
 * ```ts
 * const icalString = serializeICalComponent(component);
 * ```
 */
export declare function serializeICalComponent(component: ICAL.Component): string;
/**
 * Update the SEQUENCE property in a component (auto-increment)
 *
 * RFC 5545 Section 3.8.7.4: SEQUENCE is a non-negative integer that
 * indicates the revision sequence number of the calendar component.
 * It MUST be incremented each time the component is modified.
 *
 * @param component - ICAL.Component (VEVENT or VTODO)
 *
 * @example
 * ```ts
 * updateSequence(vevent);
 * // SEQUENCE:0 => SEQUENCE:1
 * ```
 */
export declare function updateSequence(component: ICAL.Component): void;
/**
 * Update the DTSTAMP property in a component (current timestamp)
 *
 * RFC 5545 Section 3.8.7.2: DTSTAMP indicates the date and time that
 * the instance of the iCalendar object was created.
 * In practice, it SHOULD be updated whenever the component is modified.
 *
 * @param component - ICAL.Component (VEVENT or VTODO)
 *
 * @example
 * ```ts
 * updateDtstamp(vevent);
 * // DTSTAMP:20250101T120000Z => DTSTAMP:20250125T161520Z (current time)
 * ```
 */
export declare function updateDtstamp(component: ICAL.Component): void;
/**
 * Preserve VTIMEZONE components when updating events
 *
 * VTIMEZONE components define timezone information and should be preserved
 * when updating events, as they may be referenced by DTSTART/DTEND.
 *
 * @param vcalendar - VCALENDAR component
 * @returns VCALENDAR with preserved VTIMEZONE components
 *
 * @example
 * ```ts
 * const updated = preserveVTimezone(vcalendar);
 * ```
 */
export declare function preserveVTimezone(vcalendar: ICAL.Component): ICAL.Component;
/**
 * Preserve vendor-specific properties (X-* properties)
 *
 * Many CalDAV servers add custom properties like:
 * - X-APPLE-SORT-ORDER
 * - X-GOOGLE-CALENDAR-ID
 * - X-MICROSOFT-CDO-*
 *
 * This function copies all X-* properties from the original to the updated component.
 *
 * @param updatedComponent - Component being updated
 * @param originalComponent - Original component with vendor properties
 *
 * @example
 * ```ts
 * preserveVendorProperties(updatedEvent, originalEvent);
 * ```
 */
export declare function preserveVendorProperties(updatedComponent: ICAL.Component, originalComponent: ICAL.Component): void;
/**
 * Get current SEQUENCE value from a component
 *
 * @param component - ICAL.Component
 * @returns Current SEQUENCE value (0 if not present)
 */
export declare function getSequence(component: ICAL.Component): number;
/**
 * Get current DTSTAMP value from a component
 *
 * @param component - ICAL.Component
 * @returns Current DTSTAMP value (ISO string) or null if not present
 */
export declare function getDtstamp(component: ICAL.Component): string | null;
/**
 * Validate that UID is not being modified
 *
 * RFC 5545: UID is a globally unique identifier and MUST NOT change
 * for the same calendar component.
 *
 * @param component - ICAL.Component
 * @throws Error if UID is missing
 */
export declare function validateUid(component: ICAL.Component): void;
