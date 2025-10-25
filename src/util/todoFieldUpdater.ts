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

import ICAL from 'ical.js';

import { DAVCalendarObject } from '../types/models';
import { BaseFieldUpdaterConfig, FieldUpdateResult, TodoFields } from '../types/fieldUpdates';

import {
  getDtstamp,
  getSequence,
  parseICalComponent,
  preserveVendorProperties,
  serializeICalComponent,
  updateDtstamp,
  updateSequence,
  validateUid,
} from './fieldUpdater';

/**
 * Default configuration for VTODO field updates
 */
const DEFAULT_CONFIG: Required<BaseFieldUpdaterConfig> = {
  autoIncrementSequence: true,
  autoUpdateDtstamp: true,
  preserveUnknownFields: true,
  preserveVendorExtensions: true,
};

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
export function updateTodoFields(
  calendarObject: DAVCalendarObject,
  fields: TodoFields,
  config?: BaseFieldUpdaterConfig
): FieldUpdateResult {
  // Merge config with defaults
  const finalConfig: Required<BaseFieldUpdaterConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Validate input
  if (!calendarObject.data) {
    throw new Error('calendarObject.data is required');
  }

  if (typeof calendarObject.data !== 'string') {
    throw new Error('calendarObject.data must be a string (iCal format)');
  }

  // Parse the iCal string
  const vcalendar = parseICalComponent(calendarObject.data);

  // Extract VTODO component (may be nested in VCALENDAR)
  const vtodo = vcalendar.getFirstSubcomponent('vtodo');
  if (!vtodo) {
    throw new Error('VTODO component not found in calendar object');
  }

  // Validate UID exists (MUST NOT be modified)
  validateUid(vtodo);

  // Clone the original vtodo for comparison and vendor property preservation
  const originalVtodo = new ICAL.Component(vtodo.toJSON());

  // Track if any fields were actually modified
  let modified = false;
  const warnings: string[] = [];

  // Update fields
  if (fields.SUMMARY !== undefined) {
    const currentSummary = vtodo.getFirstPropertyValue('summary');
    if (currentSummary !== fields.SUMMARY) {
      if (fields.SUMMARY === null || fields.SUMMARY === '') {
        // Remove property if value is null/empty
        const prop = vtodo.getFirstProperty('summary');
        if (prop) {
          vtodo.removeProperty(prop);
          modified = true;
        }
      } else {
        // Update or add property
        if (vtodo.getFirstProperty('summary')) {
          vtodo.updatePropertyWithValue('summary', fields.SUMMARY);
        } else {
          vtodo.addPropertyWithValue('summary', fields.SUMMARY);
        }
        modified = true;
      }
    }
  }

  if (fields.DESCRIPTION !== undefined) {
    const currentDescription = vtodo.getFirstPropertyValue('description');
    if (currentDescription !== fields.DESCRIPTION) {
      if (fields.DESCRIPTION === null || fields.DESCRIPTION === '') {
        // Remove property if value is null/empty
        const prop = vtodo.getFirstProperty('description');
        if (prop) {
          vtodo.removeProperty(prop);
          modified = true;
        }
      } else {
        // Update or add property
        if (vtodo.getFirstProperty('description')) {
          vtodo.updatePropertyWithValue('description', fields.DESCRIPTION);
        } else {
          vtodo.addPropertyWithValue('description', fields.DESCRIPTION);
        }
        modified = true;
      }
    }
  }

  // Auto-update SEQUENCE if configured and modified
  let newSequence: number | undefined;
  if (finalConfig.autoIncrementSequence && modified) {
    const oldSequence = getSequence(vtodo);
    updateSequence(vtodo);
    newSequence = getSequence(vtodo);

    // Warn if sequence didn't change (shouldn't happen)
    if (oldSequence === newSequence) {
      warnings.push(`SEQUENCE already at value ${newSequence}, not incremented`);
    }
  }

  // Auto-update DTSTAMP if configured and modified
  let newDtstamp: string | undefined;
  if (finalConfig.autoUpdateDtstamp && modified) {
    updateDtstamp(vtodo);
    newDtstamp = getDtstamp(vtodo) || undefined;
  }

  // Preserve vendor extensions if configured
  let vendorExtensionsCount = 0;
  if (finalConfig.preserveVendorExtensions) {
    // Count vendor properties before preservation
    const vendorProps = originalVtodo.getAllProperties().filter((prop) =>
      prop.name.toLowerCase().startsWith('x-')
    );
    vendorExtensionsCount = vendorProps.length;

    preserveVendorProperties(vtodo, originalVtodo);

    if (vendorExtensionsCount > 0) {
      warnings.push(`Preserved ${vendorExtensionsCount} vendor extension(s)`);
    }
  }

  // Validate UID again (ensure it wasn't accidentally modified)
  validateUid(vtodo);

  // Serialize back to iCal string
  const updatedData = serializeICalComponent(vcalendar);

  return {
    data: updatedData,
    modified,
    warnings: warnings.length > 0 ? warnings : undefined,
    metadata: {
      sequence: newSequence,
      dtstamp: newDtstamp,
      vendorExtensionsCount: vendorExtensionsCount > 0 ? vendorExtensionsCount : undefined,
    },
  };
}

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
export function batchUpdateTodoFields(
  calendarObjects: DAVCalendarObject[],
  fields: TodoFields,
  config?: BaseFieldUpdaterConfig
): FieldUpdateResult[] {
  return calendarObjects.map((obj) => updateTodoFields(obj, fields, config));
}

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
export function isTodoObject(calendarObject: DAVCalendarObject): boolean {
  try {
    if (!calendarObject.data || typeof calendarObject.data !== 'string') {
      return false;
    }

    const vcalendar = parseICalComponent(calendarObject.data);
    const vtodo = vcalendar.getFirstSubcomponent('vtodo');
    return vtodo !== null;
  } catch {
    return false;
  }
}

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
export function extractTodoFields(calendarObject: DAVCalendarObject): TodoFields {
  if (!calendarObject.data || typeof calendarObject.data !== 'string') {
    throw new Error('calendarObject.data must be a string (iCal format)');
  }

  const vcalendar = parseICalComponent(calendarObject.data);
  const vtodo = vcalendar.getFirstSubcomponent('vtodo');

  if (!vtodo) {
    throw new Error('VTODO component not found in calendar object');
  }

  const fields: TodoFields = {};

  // Extract SUMMARY
  const summary = vtodo.getFirstPropertyValue('summary');
  if (summary !== null && typeof summary === 'string') {
    fields.SUMMARY = summary;
  }

  // Extract DESCRIPTION
  const description = vtodo.getFirstPropertyValue('description');
  if (description !== null && typeof description === 'string') {
    fields.DESCRIPTION = description;
  }

  return fields;
}
