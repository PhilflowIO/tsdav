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
export function parseLine(line: string): ParsedLine {
  // Find the colon that separates key from value
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) {
    throw new Error(`Invalid iCal/vCard line (no colon): ${line}`);
  }

  const keyPart = line.substring(0, colonIndex);
  const value = line.substring(colonIndex + 1);

  // Check for parameters (semicolon-separated)
  const semicolonIndex = keyPart.indexOf(';');
  if (semicolonIndex === -1) {
    // No parameters
    return { key: keyPart, value };
  }

  // Parse parameters
  const key = keyPart.substring(0, semicolonIndex);
  const paramsString = keyPart.substring(semicolonIndex + 1);
  const params: Record<string, string> = {};

  paramsString.split(';').forEach((param) => {
    const [paramKey, paramValue] = param.split('=');
    if (paramKey && paramValue) {
      params[paramKey.trim()] = paramValue.trim();
    }
  });

  return { key, value, params };
}

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
export function foldLine(line: string, maxLength = 75): string {
  if (line.length <= maxLength) {
    return line;
  }

  const folded: string[] = [];
  let remaining = line;

  // First line can be full length
  folded.push(remaining.substring(0, maxLength));
  remaining = remaining.substring(maxLength);

  // Subsequent lines are maxLength - 1 (accounting for leading space)
  while (remaining.length > 0) {
    const chunk = remaining.substring(0, maxLength - 1);
    folded.push(` ${chunk}`); // Leading space indicates continuation
    remaining = remaining.substring(maxLength - 1);
  }

  return folded.join('\r\n');
}

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
export function unfoldLines(icalString: string): string {
  // Replace CRLF + SPACE with nothing (unfold)
  // Also handle LF + SPACE (some servers use LF instead of CRLF)
  return icalString.replace(/\r\n /g, '').replace(/\n /g, '');
}

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
export function parseICalComponent(icalString: string): ICAL.Component {
  try {
    // ical.js expects unfolded lines
    const unfolded = unfoldLines(icalString);
    const jcalData = ICAL.parse(unfolded);
    return new ICAL.Component(jcalData);
  } catch (error) {
    throw new Error(
      `Failed to parse iCal component: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

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
export function serializeICalComponent(component: ICAL.Component): string {
  try {
    const serialized = component.toString();

    // ical.js may not fold lines, so we need to do it manually
    const lines = serialized.split(/\r\n|\n/);
    const foldedLines = lines.map((line) => foldLine(line));

    return foldedLines.join('\r\n');
  } catch (error) {
    throw new Error(
      `Failed to serialize iCal component: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

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
export function updateSequence(component: ICAL.Component): void {
  const currentSequence = component.getFirstPropertyValue('sequence');
  const newSequence = typeof currentSequence === 'number' ? currentSequence + 1 : 0;

  if (component.getFirstProperty('sequence')) {
    component.updatePropertyWithValue('sequence', newSequence);
  } else {
    component.addPropertyWithValue('sequence', newSequence);
  }
}

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
export function updateDtstamp(component: ICAL.Component): void {
  // Get current timestamp in UTC
  const now = ICAL.Time.now();

  if (component.getFirstProperty('dtstamp')) {
    component.updatePropertyWithValue('dtstamp', now);
  } else {
    component.addPropertyWithValue('dtstamp', now);
  }
}

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
export function preserveVTimezone(vcalendar: ICAL.Component): ICAL.Component {
  // VTIMEZONE components are already part of the VCALENDAR
  // This function is a no-op for now, but provides a hook for future enhancements
  return vcalendar;
}

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
export function preserveVendorProperties(
  updatedComponent: ICAL.Component,
  originalComponent: ICAL.Component
): void {
  const originalProps = originalComponent.getAllProperties();

  originalProps.forEach((prop) => {
    const propName = prop.name;

    // Check if it's a vendor extension (starts with X- or x-)
    if (propName.toLowerCase().startsWith('x-')) {
      // Only add if not already present in updated component
      // Check case-insensitively
      const existingProp = updatedComponent.getAllProperties().find(
        (p) => p.name.toLowerCase() === propName.toLowerCase()
      );

      if (!existingProp) {
        updatedComponent.addProperty(prop);
      }
    }
  });
}

/**
 * Get current SEQUENCE value from a component
 *
 * @param component - ICAL.Component
 * @returns Current SEQUENCE value (0 if not present)
 */
export function getSequence(component: ICAL.Component): number {
  const sequence = component.getFirstPropertyValue('sequence');
  return typeof sequence === 'number' ? sequence : 0;
}

/**
 * Get current DTSTAMP value from a component
 *
 * @param component - ICAL.Component
 * @returns Current DTSTAMP value (ISO string) or null if not present
 */
export function getDtstamp(component: ICAL.Component): string | null {
  const dtstamp = component.getFirstPropertyValue('dtstamp');
  if (!dtstamp) return null;

  // If it's an ICAL.Time object, convert to iCal format
  if (typeof dtstamp === 'object' && 'toICALString' in dtstamp && typeof dtstamp.toICALString === 'function') {
    return dtstamp.toICALString();
  }

  // Fallback to string representation
  return dtstamp.toString();
}

/**
 * Validate that UID is not being modified
 *
 * RFC 5545: UID is a globally unique identifier and MUST NOT change
 * for the same calendar component.
 *
 * @param component - ICAL.Component
 * @throws Error if UID is missing
 */
export function validateUid(component: ICAL.Component): void {
  const uid = component.getFirstPropertyValue('uid');
  if (!uid) {
    throw new Error('UID property is required and must not be removed');
  }
}
