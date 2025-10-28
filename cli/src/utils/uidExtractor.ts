/**
 * UID Extraction Utility
 * Parses iCalendar data to extract UID field
 * Critical for Google/ZOHO providers (require UID as filename)
 */

import ICAL from 'ical.js';

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
