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
import { DAVVCard } from '../types/models';
import { VCardFields, FieldUpdateResult, BaseFieldUpdaterConfig } from '../types/fieldUpdates';
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
export declare function updateVCardFields(vCard: DAVVCard, fields: VCardFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult;
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
export declare function validateVCardFields(fields: VCardFields): string[];
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
export declare function extractVCardFields(vCard: DAVVCard): Partial<VCardFields>;
