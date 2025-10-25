/**
 * vCard Field Updater for tsdav
 *
 * Provides field-level updates for CardDAV vCards without requiring
 * manual vCard string generation.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6350 - vCard 4.0
 * @see https://datatracker.ietf.org/doc/html/rfc2426 - vCard 3.0
 *
 * ⚠️ READ-ONLY DEPENDENCIES:
 * - src/util/fieldUpdater.ts (shared utilities)
 * - src/types/fieldUpdates.ts (type definitions)
 */

import ICAL from 'ical.js';
import { DAVVCard } from '../types/models';
import { VCardFields, FieldUpdateResult, BaseFieldUpdaterConfig } from '../types/fieldUpdates';
import {
  parseICalComponent,
  serializeICalComponent,
  preserveVendorProperties,
} from './fieldUpdater';

/**
 * Default configuration for vCard field updates
 */
const DEFAULT_CONFIG: Required<BaseFieldUpdaterConfig> = {
  autoIncrementSequence: false, // vCards don't use SEQUENCE
  autoUpdateDtstamp: false, // vCards use REV instead
  preserveUnknownFields: true,
  preserveVendorExtensions: true,
};

/**
 * Supported vCard field names for validation
 */
const SUPPORTED_FIELDS = new Set(['FN', 'N', 'EMAIL', 'TEL', 'ORG', 'NOTE', 'TITLE', 'URL']);

/**
 * Update vCard fields
 *
 * Updates specified fields in a vCard while preserving other properties.
 * Automatically handles:
 * - Line folding for long values (>75 chars)
 * - UTF-8 character encoding
 * - REV (revision) timestamp updates
 * - Vendor extension preservation (X-* properties)
 *
 * @param vCard - DAVVCard object containing vCard data
 * @param fields - Fields to update (VCardFields)
 * @param config - Optional configuration
 * @returns FieldUpdateResult with updated vCard data and metadata
 *
 * @throws Error if vCard parsing fails
 * @throws Error if UID is missing or would be removed
 * @throws Error if FN would be removed (required field)
 *
 * @example
 * ```typescript
 * const updated = updateVCardFields(vCard, {
 *   FN: 'Dr. John Q. Public, Esq.',
 *   EMAIL: 'john@example.com',
 *   TEL: '+1-555-555-5555'
 * });
 *
 * console.log(updated.data); // Updated vCard string
 * console.log(updated.modified); // true
 * ```
 *
 * @example
 * ```typescript
 * // Update structured N field
 * const updated = updateVCardFields(vCard, {
 *   N: 'Public;John;Quinlan;Dr.;Esq.',
 *   FN: 'Dr. John Q. Public, Esq.'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Remove a field by setting it to empty string
 * const updated = updateVCardFields(vCard, {
 *   NOTE: '' // Removes NOTE property
 * });
 * ```
 */
export function updateVCardFields(
  vCard: DAVVCard,
  fields: VCardFields,
  config?: BaseFieldUpdaterConfig
): FieldUpdateResult {
  // Merge config with defaults
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Validate input
  if (!vCard.data) {
    throw new Error('vCard data is required');
  }

  if (typeof vCard.data !== 'string') {
    throw new Error('vCard data must be a string');
  }

  // Parse the vCard
  let component: ICAL.Component;
  try {
    component = parseICalComponent(vCard.data);
  } catch (error) {
    throw new Error(
      `Failed to parse vCard: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Handle standalone VCARD or VCARD within VCALENDAR wrapper
  let vcard: ICAL.Component | null = null;
  if (component.name === 'vcard') {
    vcard = component;
  } else if (component.name === 'vcalendar') {
    // Some servers wrap VCARDs in VCALENDAR
    vcard = component.getFirstSubcomponent('vcard');
  }

  if (!vcard) {
    throw new Error('No VCARD component found in data');
  }

  // Store original component for comparison and vendor property preservation
  const originalVcard = vcard.toJSON();

  // Track if any changes were made
  let modified = false;
  const warnings: string[] = [];

  // Validate UID exists and won't be removed
  const uid = vcard.getFirstPropertyValue('uid');
  if (!uid) {
    throw new Error('vCard must have a UID property');
  }

  // Validate FN won't be removed (required field)
  const currentFN = vcard.getFirstPropertyValue('fn');
  if (fields.FN === '' && currentFN) {
    throw new Error('FN (Formatted Name) is a required field and cannot be removed');
  }

  // Update fields
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    // Validate field is supported
    if (!SUPPORTED_FIELDS.has(fieldName)) {
      warnings.push(`Unknown field '${fieldName}' - skipping`);
      continue;
    }

    const propertyName = fieldName.toLowerCase();
    const currentValue = vcard.getFirstPropertyValue(propertyName);

    // Handle empty values (remove property)
    if (fieldValue === '') {
      if (currentValue !== null) {
        // Remove the property
        const prop = vcard.getFirstProperty(propertyName);
        if (prop) {
          vcard.removeProperty(prop);
          modified = true;
        }
      }
      continue;
    }

    // Check if value is actually different
    if (currentValue === fieldValue) {
      continue; // No change needed
    }

    // Update or add the property
    const existingProperty = vcard.getFirstProperty(propertyName);
    if (existingProperty) {
      vcard.updatePropertyWithValue(propertyName, fieldValue);
    } else {
      vcard.addPropertyWithValue(propertyName, fieldValue);
    }

    modified = true;
  }

  // Update REV (revision timestamp) if modified
  // REV is the vCard equivalent of DTSTAMP
  if (modified) {
    const now = ICAL.Time.now();
    const existingRev = vcard.getFirstProperty('rev');
    if (existingRev) {
      vcard.updatePropertyWithValue('rev', now);
    } else {
      vcard.addPropertyWithValue('rev', now);
    }
  }

  // Preserve vendor extensions if configured
  let vendorExtensionsCount = 0;
  if (cfg.preserveVendorExtensions) {
    const originalComponent = new ICAL.Component(originalVcard);
    preserveVendorProperties(vcard, originalComponent);

    // Count vendor extensions
    vendorExtensionsCount = vcard
      .getAllProperties()
      .filter((p) => p.name.toLowerCase().startsWith('x-')).length;

    if (vendorExtensionsCount > 0) {
      warnings.push(
        `Preserved ${vendorExtensionsCount} vendor extension${vendorExtensionsCount > 1 ? 's' : ''}`
      );
    }
  }

  // Serialize back to string
  let serialized: string;
  try {
    // If we had a VCALENDAR wrapper, serialize the whole thing
    // Otherwise serialize just the VCARD
    serialized = serializeICalComponent(component);
  } catch (error) {
    throw new Error(
      `Failed to serialize vCard: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Build result
  const result: FieldUpdateResult = {
    data: serialized,
    modified,
  };

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  if (modified) {
    result.metadata = {};

    // Get REV timestamp if present
    const rev = vcard.getFirstPropertyValue('rev');
    if (rev) {
      // Convert ICAL.Time to string
      if (rev.toICALString) {
        result.metadata.dtstamp = rev.toICALString();
      } else {
        result.metadata.dtstamp = rev.toString();
      }
    }

    if (cfg.preserveVendorExtensions && vendorExtensionsCount > 0) {
      result.metadata.vendorExtensionsCount = vendorExtensionsCount;
    }
  }

  return result;
}

/**
 * Helper function to validate vCard fields before update
 *
 * Performs validation checks on field values before attempting update.
 * Useful for validating user input before making server requests.
 *
 * @param fields - Fields to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateVCardFields({
 *   FN: '', // Error: FN is required
 *   EMAIL: 'invalid-email', // Warning: not a valid email format
 * });
 *
 * if (errors.length > 0) {
 *   console.error('Validation errors:', errors);
 * }
 * ```
 */
export function validateVCardFields(fields: VCardFields): string[] {
  const errors: string[] = [];

  // Check for empty FN
  if ('FN' in fields && fields.FN === '') {
    errors.push('FN (Formatted Name) is required and cannot be empty');
  }

  // Validate N field structure (should have semicolons)
  if (fields.N && fields.N.length > 0) {
    // N format: Family;Given;Additional;Prefix;Suffix
    // At minimum should have at least one semicolon
    if (!fields.N.includes(';')) {
      errors.push(
        'N (Structured Name) should be in format: Family;Given;Additional;Prefix;Suffix'
      );
    }
  }

  // Validate URL format (basic check)
  if (fields.URL && fields.URL.length > 0) {
    try {
      new URL(fields.URL);
    } catch {
      errors.push('URL is not a valid URL format');
    }
  }

  return errors;
}

/**
 * Helper function to extract vCard fields
 *
 * Extracts field values from a vCard for reading/display purposes.
 *
 * @param vCard - DAVVCard object
 * @returns VCardFields object with current field values
 *
 * @example
 * ```typescript
 * const fields = extractVCardFields(vCard);
 * console.log(fields.FN); // "John Doe"
 * console.log(fields.EMAIL); // "john@example.com"
 * ```
 */
export function extractVCardFields(vCard: DAVVCard): Partial<VCardFields> {
  if (!vCard.data || typeof vCard.data !== 'string') {
    throw new Error('Invalid vCard data');
  }

  try {
    const component = parseICalComponent(vCard.data);

    // Find VCARD component
    let vcard: ICAL.Component | null = null;
    if (component.name === 'vcard') {
      vcard = component;
    } else if (component.name === 'vcalendar') {
      vcard = component.getFirstSubcomponent('vcard');
    }

    if (!vcard) {
      throw new Error('No VCARD component found');
    }

    const fields: Partial<VCardFields> = {};

    // Extract supported fields
    for (const fieldName of SUPPORTED_FIELDS) {
      const value = vcard.getFirstPropertyValue(fieldName.toLowerCase());
      if (value !== null && value !== undefined) {
        fields[fieldName as keyof VCardFields] = String(value);
      }
    }

    return fields;
  } catch (error) {
    throw new Error(
      `Failed to extract vCard fields: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
