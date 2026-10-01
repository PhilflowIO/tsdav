import { DAVNamespace } from '../consts';
import type { NoUndefinedField } from './typeHelpers';
/** Ensure a directory or collection URL ends with a trailing slash for relative resolution. */
export declare const ensureTrailingSlash: (url: string) => string;
/**
 * Strict URL equality after trimming whitespace and a single trailing slash.
 * Two URLs are equal if and only if their normalized forms are identical.
 */
export declare const urlEquals: (urlA?: string, urlB?: string) => boolean;
/**
 * Loose URL containment check used for matching DAV responses against known
 * collection/principal URLs. Tolerates trailing slashes and partial vs. full
 * URLs (e.g. "www.example.com" vs. "https://www.example.com/").
 *
 * NOTE: this is intentionally permissive to accommodate DAV servers that
 * return hrefs as paths instead of full URLs. Callers MUST only compare URLs
 * at the same hierarchy level (collection-to-collection, object-to-object).
 * Comparing a collection URL against an object URL will produce false
 * positives because the collection URL is a prefix of the object URL.
 */
export declare const urlContains: (urlA?: string, urlB?: string) => boolean;
/**
 * Compare two DAV hrefs as resource identifiers after resolving relative
 * hrefs against the same collection or account URL.
 */
export declare const urlMatches: (urlA?: string, urlB?: string, baseUrl?: string) => boolean;
export declare const getDAVAttribute: (nsArr: DAVNamespace[]) => {
    [key: string]: DAVNamespace;
};
export declare const cleanupFalsy: <T extends object = object>(obj: T) => NoUndefinedField<T>;
export declare const conditionalParam: <T>(key: string, param: T) => {
    [key: string]: T;
};
export declare const excludeHeaders: (headers: Record<string, string> | undefined, headersToExclude: string[] | undefined) => Record<string, string>;
/** Default object URL filter for calendar/todo collections: keep only `.ics` resources. */
export declare const defaultIcsFilter: (url: string) => boolean;
/**
 * Validate a time-range input: both endpoints must be ISO-8601 shaped AND
 * parse to a real Date (so values like `0000-13-99` get rejected).
 */
export declare const validateTimeRange: (timeRange: {
    start: string;
    end: string;
}) => void;
/** Merge all valid HeadersInit forms with case-insensitive last-write-wins semantics. */
export declare const mergeHeaders: (...headerSources: Array<HeadersInit | undefined>) => Record<string, string>;
