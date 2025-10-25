/**
 * Calendar Event (VEVENT) Field Updater
 *
 * This module provides field-based updates for CalDAV calendar events (VEVENT).
 * It allows updating individual fields like SUMMARY and DESCRIPTION without
 * requiring manual iCal string generation.
 *
 * Features:
 * - Update SUMMARY and DESCRIPTION fields
 * - Auto-increment SEQUENCE on modifications (RFC 5545)
 * - Auto-update DTSTAMP to current timestamp
 * - Preserve VCALENDAR wrapper and VTIMEZONE components
 * - Preserve vendor extensions (X-* properties)
 * - Protect UID from modification
 * - Proper RFC 5545 line folding for long values
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.1
 */
import { DAVCalendarObject } from '../types/models';
import { EventFields, FieldUpdateResult, BaseFieldUpdaterConfig } from '../types/fieldUpdates';
/**
 * Update fields in a calendar event (VEVENT)
 *
 * This function updates specified fields in a CalDAV calendar object while
 * preserving the VCALENDAR structure, VTIMEZONE components, and vendor extensions.
 *
 * @param calendarObject - DAVCalendarObject containing iCal data
 * @param fields - Fields to update (SUMMARY, DESCRIPTION)
 * @param config - Optional configuration for update behavior
 * @returns FieldUpdateResult with updated iCal string and metadata
 *
 * @throws Error if UID is missing or invalid iCal format
 *
 * @example
 * ```typescript
 * const updated = updateEventFields(calendarObject, {
 *   SUMMARY: 'Updated Meeting Title',
 *   DESCRIPTION: 'New detailed description'
 * });
 * console.log(updated.data); // Updated iCal string
 * console.log(updated.metadata.sequence); // Incremented sequence number
 * ```
 */
export declare function updateEventFields(calendarObject: DAVCalendarObject, fields: EventFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult;
/**
 * Check if a calendar object contains a valid VEVENT
 *
 * Utility function to validate that a calendar object has a proper VEVENT component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns true if valid VEVENT exists
 */
export declare function hasValidVEvent(calendarObject: DAVCalendarObject): boolean;
/**
 * Extract event fields from a calendar object
 *
 * Utility function to extract current field values from a VEVENT
 *
 * @param calendarObject - DAVCalendarObject to extract from
 * @returns EventFields with current values
 *
 * @example
 * ```typescript
 * const currentFields = extractEventFields(calendarObject);
 * console.log(currentFields.SUMMARY); // "Team Meeting"
 * console.log(currentFields.DESCRIPTION); // "Quarterly review"
 * ```
 */
export declare function extractEventFields(calendarObject: DAVCalendarObject): EventFields;
