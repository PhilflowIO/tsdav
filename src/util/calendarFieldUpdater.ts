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

import ICAL from 'ical.js';
import { DAVCalendarObject } from '../types/models';
import { EventFields, FieldUpdateResult, BaseFieldUpdaterConfig } from '../types/fieldUpdates';
import {
  parseICalComponent,
  serializeICalComponent,
  updateSequence,
  updateDtstamp,
  preserveVendorProperties,
  getSequence,
  getDtstamp,
  validateUid,
} from './fieldUpdater';

/**
 * Default configuration for event field updates
 */
const DEFAULT_CONFIG: Required<BaseFieldUpdaterConfig> = {
  autoIncrementSequence: true,
  autoUpdateDtstamp: true,
  preserveUnknownFields: true,
  preserveVendorExtensions: true,
};

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
export function updateEventFields(
  calendarObject: DAVCalendarObject,
  fields: EventFields,
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

  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('At least one field must be specified for update');
  }

  const warnings: string[] = [];
  let modified = false;

  try {
    // Parse the iCal string into a component tree
    const vcalendar = parseICalComponent(calendarObject.data);

    // Extract VEVENT component from VCALENDAR
    const vevent = vcalendar.getFirstSubcomponent('vevent');
    if (!vevent) {
      throw new Error('VEVENT component not found in VCALENDAR');
    }

    // Validate UID exists and is not being modified
    validateUid(vevent);
    const originalUid = vevent.getFirstPropertyValue('uid');

    // Preserve original VEVENT for comparison
    const originalVevent = new ICAL.Component(vevent.toJSON());

    // Update each specified field
    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      const normalizedFieldName = fieldName.toLowerCase();

      // Get current value
      const currentValue = vevent.getFirstPropertyValue(normalizedFieldName);

      // Check if field actually changed
      if (currentValue === fieldValue) {
        continue; // Skip if no change
      }

      modified = true;

      // Update or remove the field
      if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
        // Remove the property if value is empty
        const prop = vevent.getFirstProperty(normalizedFieldName);
        if (prop) {
          vevent.removeProperty(prop);
          warnings.push(`${fieldName} removed (empty value provided)`);
        }
      } else {
        // Update the property
        if (vevent.getFirstProperty(normalizedFieldName)) {
          vevent.updatePropertyWithValue(normalizedFieldName, fieldValue);
        } else {
          vevent.addPropertyWithValue(normalizedFieldName, fieldValue);
        }
      }
    }

    // Auto-update SEQUENCE and DTSTAMP if fields were modified
    if (modified) {
      // Auto-increment SEQUENCE
      if (finalConfig.autoIncrementSequence) {
        updateSequence(vevent);
      }

      // Auto-update DTSTAMP
      if (finalConfig.autoUpdateDtstamp) {
        updateDtstamp(vevent);
      }
    }

    // Preserve vendor extensions (X-* properties)
    if (finalConfig.preserveVendorExtensions) {
      preserveVendorProperties(vevent, originalVevent);
    }

    // Validate UID was not modified
    const finalUid = vevent.getFirstPropertyValue('uid');
    if (finalUid !== originalUid) {
      throw new Error('UID must not be modified');
    }

    // Check for VTIMEZONE components (they should be preserved automatically)
    const vtimezones = vcalendar.getAllSubcomponents('vtimezone');
    if (vtimezones.length === 0) {
      // This is not an error, just informational
      // Many simple events don't have VTIMEZONE
    }

    // Serialize back to iCal string
    const updatedIcalString = serializeICalComponent(vcalendar);

    // Get metadata
    const sequence = getSequence(vevent);
    const dtstampValue = getDtstamp(vevent);

    // Count vendor extensions
    const vendorExtensionsCount = vevent
      .getAllProperties()
      .filter((p) => p.name.toLowerCase().startsWith('x-')).length;

    if (vendorExtensionsCount > 0) {
      warnings.push(`Preserved ${vendorExtensionsCount} vendor extension(s)`);
    }

    return {
      data: updatedIcalString,
      modified,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        sequence,
        dtstamp: dtstampValue || undefined,
        vendorExtensionsCount: vendorExtensionsCount > 0 ? vendorExtensionsCount : undefined,
      },
    };
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Failed to update event fields: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Check if a calendar object contains a valid VEVENT
 *
 * Utility function to validate that a calendar object has a proper VEVENT component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns true if valid VEVENT exists
 */
export function hasValidVEvent(calendarObject: DAVCalendarObject): boolean {
  try {
    if (!calendarObject.data) {
      return false;
    }

    const vcalendar = parseICalComponent(calendarObject.data);
    const vevent = vcalendar.getFirstSubcomponent('vevent');

    if (!vevent) {
      return false;
    }

    // Check for required UID
    const uid = vevent.getFirstPropertyValue('uid');
    return !!uid;
  } catch {
    return false;
  }
}

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
export function extractEventFields(calendarObject: DAVCalendarObject): EventFields {
  if (!calendarObject.data) {
    throw new Error('calendarObject.data is required');
  }

  try {
    const vcalendar = parseICalComponent(calendarObject.data);
    const vevent = vcalendar.getFirstSubcomponent('vevent');

    if (!vevent) {
      throw new Error('VEVENT component not found in VCALENDAR');
    }

    const fields: EventFields = {};

    // Extract SUMMARY
    const summary = vevent.getFirstPropertyValue('summary');
    if (summary !== null && summary !== undefined && typeof summary === 'string') {
      fields.SUMMARY = summary;
    }

    // Extract DESCRIPTION
    const description = vevent.getFirstPropertyValue('description');
    if (description !== null && description !== undefined && typeof description === 'string') {
      fields.DESCRIPTION = description;
    }

    return fields;
  } catch (error) {
    throw new Error(
      `Failed to extract event fields: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
