/**
 * UID Extraction Utility
 * Parses iCalendar and vCard data to extract UID field
 * Critical for Google/ZOHO providers (require UID as filename)
 */

import ICAL from 'ical.js';
import { ObjectType } from '../types/config';

export class UIDExtractor {
  /**
   * Extract UID from iCalendar data string
   * @param icalData - Raw iCalendar data (RFC 5545 format)
   * @returns UID string or null if not found
   */
  static extractUID(icalData: string): string | null {
    try {
      // Parse iCal data using ical.js
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);

      // Get VEVENT component (calendar event)
      const vevent = comp.getFirstSubcomponent('vevent');
      if (!vevent) {
        // Try VTODO (tasks) if VEVENT not found
        const vtodo = comp.getFirstSubcomponent('vtodo');
        if (!vtodo) {
          console.warn('No VEVENT or VTODO found in iCalendar data');
          return null;
        }
        return vtodo.getFirstPropertyValue('uid') as string | null;
      }

      // Extract UID property
      const uid = vevent.getFirstPropertyValue('uid') as string;
      if (!uid) {
        console.warn('VEVENT found but no UID property');
        return null;
      }

      return uid;
    } catch (error) {
      console.error('Failed to parse iCalendar data:', error);
      return null;
    }
  }

  /**
   * Extract UID using fallback regex method (if ical.js fails)
   * Less reliable but works for simple cases
   * @param icalData - Raw iCalendar data
   * @returns UID string or null if not found
   */
  static extractUIDRegex(icalData: string): string | null {
    const uidMatch = icalData.match(/^UID:(.+)$/m);
    return uidMatch ? uidMatch[1].trim() : null;
  }

  /**
   * Extract UID with fallback (try ical.js first, then regex)
   * @param icalData - Raw iCalendar data
   * @returns UID string
   * @throws Error if UID cannot be extracted
   */
  static extractUIDOrThrow(icalData: string): string {
    // Try primary method
    let uid = this.extractUID(icalData);

    // Fallback to regex if primary fails
    if (!uid) {
      uid = this.extractUIDRegex(icalData);
    }

    if (!uid) {
      throw new Error('Failed to extract UID from iCalendar data');
    }

    return uid;
  }

  /**
   * Validate iCalendar data structure
   * @param icalData - Raw iCalendar data
   * @returns true if valid, false otherwise
   */
  static validateICalendar(icalData: string): boolean {
    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);

      // Check if VCALENDAR component exists
      if (comp.name !== 'vcalendar') {
        return false;
      }

      // Check if at least one VEVENT or VTODO exists
      const vevent = comp.getFirstSubcomponent('vevent');
      const vtodo = comp.getFirstSubcomponent('vtodo');

      return !!(vevent || vtodo);
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract LAST-MODIFIED timestamp from iCalendar data
   * Used for conflict resolution (compare timestamps)
   * @param icalData - Raw iCalendar data
   * @returns ISO 8601 timestamp or null if not found
   */
  static extractLastModified(icalData: string): string | null {
    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);

      const vevent = comp.getFirstSubcomponent('vevent') || comp.getFirstSubcomponent('vtodo');
      if (!vevent) {
        return null;
      }

      const lastModified = vevent.getFirstPropertyValue('last-modified');
      if (!lastModified) {
        // Fallback to DTSTAMP if LAST-MODIFIED not present
        const dtstamp = vevent.getFirstPropertyValue('dtstamp');
        return dtstamp ? (dtstamp as ICAL.Time).toJSDate().toISOString() : null;
      }

      return (lastModified as ICAL.Time).toJSDate().toISOString();
    } catch (error) {
      console.error('Failed to extract LAST-MODIFIED:', error);
      return null;
    }
  }

  /**
   * Extract summary (title) from iCalendar data
   * WARNING: For debugging/preview only - NEVER store in state file (DSGVO violation)
   * @param icalData - Raw iCalendar data
   * @returns Summary string or null if not found
   */
  static extractSummaryForPreview(icalData: string): string | null {
    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);

      const vevent = comp.getFirstSubcomponent('vevent') || comp.getFirstSubcomponent('vtodo');
      if (!vevent) {
        return null;
      }

      return vevent.getFirstPropertyValue('summary') as string | null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract UID from vCard data string
   * @param vcardData - Raw vCard data (RFC 6350 format)
   * @returns UID string or null if not found
   */
  static extractVCardUID(vcardData: string): string | null {
    try {
      // Parse vCard data using ical.js (supports both iCalendar and vCard)
      const jcalData = ICAL.parse(vcardData);
      const comp = new ICAL.Component(jcalData);

      // Get VCARD component
      if (comp.name !== 'vcard') {
        console.warn('No VCARD found in data');
        return null;
      }

      // Extract UID property
      const uid = comp.getFirstPropertyValue('uid') as string;
      if (!uid) {
        console.warn('VCARD found but no UID property');
        return null;
      }

      return uid;
    } catch (error) {
      console.error('Failed to parse vCard data:', error);
      // Fallback to regex method
      return this.extractVCardUIDRegex(vcardData);
    }
  }

  /**
   * Extract UID from vCard using fallback regex method
   * @param vcardData - Raw vCard data
   * @returns UID string or null if not found
   */
  static extractVCardUIDRegex(vcardData: string): string | null {
    const uidMatch = vcardData.match(/^UID:(.+)$/m);
    return uidMatch ? uidMatch[1].trim() : null;
  }

  /**
   * Detect object type from raw data
   * @param data - Raw data string (iCalendar or vCard)
   * @returns Object type (VEVENT, VTODO, VCARD) or null if cannot detect
   */
  static detectObjectType(data: string): ObjectType | null {
    try {
      const jcalData = ICAL.parse(data);
      const comp = new ICAL.Component(jcalData);

      if (comp.name === 'vcard') {
        return 'VCARD';
      }

      if (comp.name === 'vcalendar') {
        const vevent = comp.getFirstSubcomponent('vevent');
        if (vevent) return 'VEVENT';

        const vtodo = comp.getFirstSubcomponent('vtodo');
        if (vtodo) return 'VTODO';
      }

      return null;
    } catch (error) {
      // Fallback to regex detection
      if (/BEGIN:VCARD/i.test(data)) return 'VCARD';
      if (/BEGIN:VEVENT/i.test(data)) return 'VEVENT';
      if (/BEGIN:VTODO/i.test(data)) return 'VTODO';
      return null;
    }
  }

  /**
   * Extract UID based on detected object type (unified method)
   * @param data - Raw data string (iCalendar or vCard)
   * @returns UID string or null if not found
   */
  static extractUIDUnified(data: string): string | null {
    const objectType = this.detectObjectType(data);

    if (objectType === 'VCARD') {
      return this.extractVCardUID(data);
    }

    // VEVENT or VTODO (both use iCalendar format)
    return this.extractUID(data);
  }

  /**
   * Extract UID based on detected object type (throws if not found)
   * @param data - Raw data string (iCalendar or vCard)
   * @returns UID string
   * @throws Error if UID cannot be extracted
   */
  static extractUIDUnifiedOrThrow(data: string): string {
    const uid = this.extractUIDUnified(data);

    if (!uid) {
      throw new Error('Failed to extract UID from data');
    }

    return uid;
  }

  /**
   * Generate safe filename from UID
   * Removes characters not allowed in filenames
   * @param uid - UID string
   * @returns Safe filename (without .ics extension)
   */
  static generateFilename(uid: string): string {
    // Remove or replace characters not allowed in filenames
    // Keep alphanumeric, dash, underscore, dot
    return uid.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
