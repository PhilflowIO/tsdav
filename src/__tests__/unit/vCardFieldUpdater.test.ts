import {
  updateVCardFields,
  validateVCardFields,
  extractVCardFields,
} from '../../util/vCardFieldUpdater';
import { DAVVCard } from '../../types/models';

describe('vCardFieldUpdater', () => {
  // Sample vCard for testing
  const sampleVCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'UID:test-uid-123',
    'FN:John Doe',
    'N:Doe;John;Q;Mr.;Jr.',
    'EMAIL:john.doe@example.com',
    'TEL:+1-555-555-5555',
    'ORG:Acme Corporation',
    'TITLE:Software Engineer',
    'NOTE:Important contact',
    'URL:https://example.com',
    'REV:2025-01-01T12:00:00Z',
    'END:VCARD',
  ].join('\r\n');

  describe('updateVCardFields', () => {
    test('should update single field (FN)', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Jane Smith',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('FN:Jane Smith');
      expect(result.data).toContain('UID:test-uid-123'); // UID preserved
      expect(result.metadata?.dtstamp).toBeTruthy(); // REV updated
    });

    test('should update multiple fields', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Jane Smith',
        EMAIL: 'jane.smith@newcompany.com',
        TEL: '+1-555-123-4567',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('FN:Jane Smith');
      expect(result.data).toContain('EMAIL:jane.smith@newcompany.com');
      expect(result.data).toContain('TEL:+1-555-123-4567');
      // Original fields should be preserved
      expect(result.data).toContain('ORG:Acme Corporation');
      expect(result.data).toContain('NOTE:Important contact');
    });

    test('should update structured N field', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        N: 'Smith;Jane;Mary;Dr.;PhD',
        FN: 'Dr. Jane M. Smith, PhD',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('N:Smith;Jane;Mary;Dr.;PhD');
      // ical.js escapes commas in property values with backslash
      expect(result.data).toContain('FN:Dr. Jane M. Smith');
    });

    test('should handle line folding for long values', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const longNote =
        'This is a very long note that definitely exceeds the seventy-five character limit ' +
        'and should be properly folded according to RFC 6350 specifications to ensure compatibility ' +
        'with all vCard parsers and CardDAV servers.';

      const result = updateVCardFields(vCard, {
        NOTE: longNote,
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('NOTE:');
      // The folded line should contain CRLF + space
      expect(result.data).toContain('\r\n ');
    });

    test('should handle UTF-8 characters', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'José García-López',
        ORG: 'Empresa Española',
        NOTE: 'Contacto importante 🎉',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('José García-López');
      expect(result.data).toContain('Empresa Española');
      expect(result.data).toContain('🎉');
    });

    test('should remove property when value is empty string', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        NOTE: '',
        TITLE: '',
      });

      expect(result.modified).toBe(true);
      expect(result.data).not.toContain('NOTE:');
      expect(result.data).not.toContain('TITLE:');
      // Other fields should be preserved
      expect(result.data).toContain('FN:John Doe');
      expect(result.data).toContain('EMAIL:john.doe@example.com');
    });

    test('should not modify when no changes needed', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'John Doe', // Same as current value
      });

      expect(result.modified).toBe(false);
      expect(result.metadata).toBeUndefined();
    });

    test('should preserve unknown properties', () => {
      const vcardWithCustomProps = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'UID:test-uid-456',
        'FN:Test User',
        'X-CUSTOM-FIELD:custom value',
        'BDAY:1990-01-15',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: vcardWithCustomProps,
        url: '/contacts/test2.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Updated User',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('FN:Updated User');
      // Unknown properties should be preserved (ical.js may reformat)
      expect(result.data).toContain('BDAY');
      expect(result.data).toContain('19900115');
    });

    test('should preserve vendor extensions (X-* properties)', () => {
      const vcardWithVendorProps = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'UID:test-uid-789',
        'FN:Vendor Test',
        'X-APPLE-SORT-ORDER:10',
        'X-GOOGLE-ID:abc123',
        'X-CUSTOM:value',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: vcardWithVendorProps,
        url: '/contacts/test3.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Updated Vendor Test',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('FN:Updated Vendor Test');
      // Vendor extensions should be preserved
      expect(result.data).toContain('X-APPLE-SORT-ORDER:10');
      expect(result.data).toContain('X-GOOGLE-ID:abc123');
      expect(result.data).toContain('X-CUSTOM:value');
      expect(result.metadata?.vendorExtensionsCount).toBe(3);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('Preserved 3 vendor extension'))).toBe(true);
    });

    test('should update REV timestamp when modified', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Updated Name',
      });

      expect(result.modified).toBe(true);
      expect(result.metadata?.dtstamp).toBeTruthy();
      // REV should be updated to current time (not the old value)
      expect(result.metadata?.dtstamp).not.toBe('20250101T120000Z');
      expect(result.data).toContain('REV:');
    });

    test('should add missing fields', () => {
      const minimalVCard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'UID:test-uid-minimal',
        'FN:Minimal User',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: minimalVCard,
        url: '/contacts/minimal.vcf',
      };

      const result = updateVCardFields(vCard, {
        EMAIL: 'minimal@example.com',
        TEL: '+1-555-999-9999',
        ORG: 'New Company',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('EMAIL:minimal@example.com');
      expect(result.data).toContain('TEL:+1-555-999-9999');
      expect(result.data).toContain('ORG:New Company');
      expect(result.data).toContain('FN:Minimal User'); // Original field preserved
    });

    test('should throw error when vCard data is missing', () => {
      const vCard: DAVVCard = {
        url: '/contacts/test.vcf',
      };

      expect(() =>
        updateVCardFields(vCard, {
          FN: 'Test',
        })
      ).toThrow('vCard data is required');
    });

    test('should throw error when vCard data is not a string', () => {
      const vCard: DAVVCard = {
        data: { invalid: 'object' } as any,
        url: '/contacts/test.vcf',
      };

      expect(() =>
        updateVCardFields(vCard, {
          FN: 'Test',
        })
      ).toThrow('vCard data must be a string');
    });

    test('should throw error for invalid vCard format', () => {
      const vCard: DAVVCard = {
        data: 'INVALID VCARD FORMAT',
        url: '/contacts/test.vcf',
      };

      expect(() =>
        updateVCardFields(vCard, {
          FN: 'Test',
        })
      ).toThrow('Failed to parse vCard');
    });

    test('should throw error when UID is missing', () => {
      const vcardNoUID = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:No UID User',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: vcardNoUID,
        url: '/contacts/nouid.vcf',
      };

      expect(() =>
        updateVCardFields(vCard, {
          FN: 'Updated',
        })
      ).toThrow('vCard must have a UID property');
    });

    test('should throw error when trying to remove FN', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      expect(() =>
        updateVCardFields(vCard, {
          FN: '',
        })
      ).toThrow('FN (Formatted Name) is a required field and cannot be removed');
    });

    test('should handle vCard without REV field', () => {
      const vcardNoRev = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'UID:test-uid-norev',
        'FN:No Rev User',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: vcardNoRev,
        url: '/contacts/norev.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Updated No Rev User',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('REV:'); // REV should be added
      expect(result.metadata?.dtstamp).toBeTruthy();
    });

    test('should warn about unsupported fields', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        FN: 'Updated',
        // @ts-expect-error Testing unsupported field
        UNSUPPORTED: 'value',
      });

      expect(result.modified).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes("Unknown field 'UNSUPPORTED'"))).toBe(true);
    });

    test('should handle config.preserveVendorExtensions = false', () => {
      const vcardWithVendorProps = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'UID:test-uid-novendor',
        'FN:No Vendor Test',
        'X-CUSTOM:should-not-be-preserved',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: vcardWithVendorProps,
        url: '/contacts/novendor.vcf',
      };

      const result = updateVCardFields(
        vCard,
        {
          FN: 'Updated No Vendor',
        },
        {
          preserveVendorExtensions: false,
        }
      );

      expect(result.modified).toBe(true);
      expect(result.data).toContain('FN:Updated No Vendor');
      // When preserveVendorExtensions is false, count should not be in metadata
      expect(result.metadata?.vendorExtensionsCount).toBeUndefined();
      // Should not have vendor extension warning
      const hasVendorWarning =
        result.warnings?.some((w) => w.includes('vendor extension')) ?? false;
      expect(hasVendorWarning).toBeFalsy();
    });

    test('should roundtrip parse and serialize', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result1 = updateVCardFields(vCard, {
        FN: 'First Update',
      });

      expect(result1.modified).toBe(true);

      const vCard2: DAVVCard = {
        data: result1.data,
        url: '/contacts/test.vcf',
      };

      const result2 = updateVCardFields(vCard2, {
        EMAIL: 'roundtrip@example.com',
      });

      expect(result2.modified).toBe(true);
      expect(result2.data).toContain('FN:First Update');
      expect(result2.data).toContain('EMAIL:roundtrip@example.com');
      expect(result2.data).toContain('UID:test-uid-123');
    });

    test('should handle bonus fields (TITLE, URL)', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {
        TITLE: 'Senior Software Engineer',
        URL: 'https://newcompany.com/profile',
      });

      expect(result.modified).toBe(true);
      expect(result.data).toContain('TITLE:Senior Software Engineer');
      expect(result.data).toContain('URL:https://newcompany.com/profile');
    });

    test('should handle empty object (no fields to update)', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const result = updateVCardFields(vCard, {});

      expect(result.modified).toBe(false);
      expect(result.data).toContain('FN:John Doe');
      expect(result.data).toContain('UID:test-uid-123');
    });
  });

  describe('validateVCardFields', () => {
    test('should return no errors for valid fields', () => {
      const errors = validateVCardFields({
        FN: 'John Doe',
        EMAIL: 'john@example.com',
        N: 'Doe;John;Q;Mr.;Jr.',
      });

      expect(errors).toEqual([]);
    });

    test('should error when FN is empty', () => {
      const errors = validateVCardFields({
        FN: '',
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('FN'))).toBe(true);
      expect(errors.some((e) => e.includes('required'))).toBe(true);
    });

    test('should error when N field lacks semicolons', () => {
      const errors = validateVCardFields({
        N: 'InvalidNameFormat',
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('N'))).toBe(true);
      expect(errors.some((e) => e.includes('Family;Given'))).toBe(true);
    });

    test('should error for invalid URL format', () => {
      const errors = validateVCardFields({
        URL: 'not-a-valid-url',
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('URL'))).toBe(true);
    });

    test('should accept valid URL formats', () => {
      const errors = validateVCardFields({
        URL: 'https://example.com',
      });

      expect(errors).toEqual([]);
    });

    test('should accept properly formatted N field', () => {
      const errors = validateVCardFields({
        N: 'Doe;John;;;',
      });

      expect(errors).toEqual([]);
    });

    test('should handle multiple validation errors', () => {
      const errors = validateVCardFields({
        FN: '',
        N: 'NoSemicolons',
        URL: 'invalid',
      });

      expect(errors.length).toBe(3);
    });
  });

  describe('extractVCardFields', () => {
    test('should extract all fields from vCard', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const fields = extractVCardFields(vCard);

      expect(fields.FN).toBe('John Doe');
      // ical.js returns N field as comma-separated (it's a structured type)
      // The actual value is stored internally as an array
      expect(fields.N).toContain('Doe');
      expect(fields.N).toContain('John');
      expect(fields.EMAIL).toBe('john.doe@example.com');
      expect(fields.TEL).toBe('+1-555-555-5555');
      expect(fields.ORG).toBe('Acme Corporation');
      expect(fields.TITLE).toBe('Software Engineer');
      expect(fields.NOTE).toBe('Important contact');
      expect(fields.URL).toBe('https://example.com');
    });

    test('should extract only present fields', () => {
      const minimalVCard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'UID:test-minimal',
        'FN:Minimal User',
        'EMAIL:minimal@example.com',
        'END:VCARD',
      ].join('\r\n');

      const vCard: DAVVCard = {
        data: minimalVCard,
        url: '/contacts/minimal.vcf',
      };

      const fields = extractVCardFields(vCard);

      expect(fields.FN).toBe('Minimal User');
      expect(fields.EMAIL).toBe('minimal@example.com');
      expect(fields.TEL).toBeUndefined();
      expect(fields.ORG).toBeUndefined();
      expect(fields.NOTE).toBeUndefined();
    });

    test('should throw error for invalid vCard', () => {
      const vCard: DAVVCard = {
        data: 'INVALID',
        url: '/contacts/invalid.vcf',
      };

      expect(() => extractVCardFields(vCard)).toThrow('Failed to extract vCard fields');
    });

    test('should throw error for missing data', () => {
      const vCard: DAVVCard = {
        url: '/contacts/nodata.vcf',
      };

      expect(() => extractVCardFields(vCard)).toThrow('Invalid vCard data');
    });

    test('should handle vCard after update', () => {
      const vCard: DAVVCard = {
        data: sampleVCard,
        url: '/contacts/test.vcf',
      };

      const updated = updateVCardFields(vCard, {
        FN: 'Jane Smith',
        EMAIL: 'jane@example.com',
      });

      const vCard2: DAVVCard = {
        data: updated.data,
        url: '/contacts/test.vcf',
      };

      const fields = extractVCardFields(vCard2);

      expect(fields.FN).toBe('Jane Smith');
      expect(fields.EMAIL).toBe('jane@example.com');
      // Other fields should still be present
      expect(fields.ORG).toBe('Acme Corporation');
      expect(fields.TEL).toBe('+1-555-555-5555');
    });
  });
});
