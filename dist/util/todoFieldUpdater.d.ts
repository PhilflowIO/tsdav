/**
 * VTODO Field-Based Updates
 *
 * This module provides field-level updates for VTODO (todo/task) objects
 * without requiring manual iCal string generation.
 *
 * Similar to eventFieldUpdater.ts but tailored for VTODO components.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.2 - VTODO Component
 */
import { DAVCalendarObject } from '../types/models';
import { BaseFieldUpdaterConfig, FieldUpdateResult, TodoFields } from '../types/fieldUpdates';
/**
 * Update fields in a VTODO calendar object
 *
 * This function allows updating specific fields in a VTODO without manually
 * constructing iCal strings. It handles:
 * - Field updates (SUMMARY, DESCRIPTION)
 * - SEQUENCE auto-increment (RFC 5545 Section 3.8.7.4)
 * - DTSTAMP auto-update (RFC 5545 Section 3.8.7.2)
 * - VCALENDAR wrapper preservation
 * - Vendor extension preservation (X-* properties)
 * - Proper line folding (RFC 5545 Section 3.1)
 *
 * @param calendarObject - DAVCalendarObject containing VTODO data
 * @param fields - Fields to update
 * @param config - Optional configuration for auto-update behavior
 * @returns FieldUpdateResult with updated iCal string and metadata
 * @throws Error if parsing fails, UID is missing, or VTODO component not found
 *
 * @example
 * ```ts
 * const updated = updateTodoFields(
 *   calendarObject,
 *   {
 *     SUMMARY: 'Updated Todo Title',
 *     DESCRIPTION: 'Updated detailed description'
 *   },
 *   {
 *     autoIncrementSequence: true,
 *     autoUpdateDtstamp: true
 *   }
 * );
 *
 * console.log(updated.data); // Updated iCal string
 * console.log(updated.modified); // true if any fields changed
 * console.log(updated.metadata.sequence); // New SEQUENCE value
 * ```
 */
export declare function updateTodoFields(calendarObject: DAVCalendarObject, fields: TodoFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult;
/**
 * Batch update multiple VTODO objects with the same fields
 *
 * This is useful for updating multiple todos with the same changes,
 * such as moving todos to a different category or updating status.
 *
 * @param calendarObjects - Array of DAVCalendarObject containing VTODO data
 * @param fields - Fields to update (same for all objects)
 * @param config - Optional configuration for auto-update behavior
 * @returns Array of FieldUpdateResult for each object
 *
 * @example
 * ```ts
 * const results = batchUpdateTodoFields(
 *   [todo1, todo2, todo3],
 *   { SUMMARY: 'Updated Title' }
 * );
 *
 * results.forEach((result, index) => {
 *   console.log(`Todo ${index}: ${result.modified ? 'modified' : 'unchanged'}`);
 * });
 * ```
 */
export declare function batchUpdateTodoFields(calendarObjects: DAVCalendarObject[], fields: TodoFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult[];
/**
 * Helper function to check if a calendar object contains a VTODO component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns True if object contains VTODO, false otherwise
 *
 * @example
 * ```ts
 * if (isTodoObject(calendarObject)) {
 *   const result = updateTodoFields(calendarObject, { SUMMARY: 'New title' });
 * }
 * ```
 */
export declare function isTodoObject(calendarObject: DAVCalendarObject): boolean;
/**
 * Extract VTODO fields from a calendar object
 *
 * Useful for reading current values before updating.
 *
 * @param calendarObject - DAVCalendarObject containing VTODO data
 * @returns TodoFields with current values
 * @throws Error if parsing fails or VTODO component not found
 *
 * @example
 * ```ts
 * const currentFields = extractTodoFields(calendarObject);
 * console.log(currentFields.SUMMARY); // "Current Todo Title"
 *
 * // Update only if needed
 * if (currentFields.SUMMARY !== desiredSummary) {
 *   updateTodoFields(calendarObject, { SUMMARY: desiredSummary });
 * }
 * ```
 */
export declare function extractTodoFields(calendarObject: DAVCalendarObject): TodoFields;
