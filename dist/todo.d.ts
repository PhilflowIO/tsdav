import { ElementCompact } from 'xml-js';
import { DAVDepth, DAVResponse } from './types/DAVTypes';
import { DAVCalendar, DAVCalendarObject } from './types/models';
/**
 * Query todos using CalDAV REPORT calendar-query
 *
 * @param params.url - Calendar URL to query
 * @param params.props - Properties to request
 * @param params.filters - Optional CalDAV filters
 * @param params.timezone - Optional timezone
 * @param params.depth - Depth header value
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Array of DAV responses
 */
export declare const todoQuery: (params: {
    url: string;
    props: ElementCompact;
    filters?: ElementCompact;
    timezone?: string;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
/**
 * Fetch multiple todos by URL using CalDAV calendar-multiget
 *
 * @param params.url - Calendar URL
 * @param params.props - Properties to request
 * @param params.objectUrls - Array of todo object URLs to fetch
 * @param params.timezone - Optional timezone
 * @param params.depth - Depth header value
 * @param params.filters - Optional CalDAV filters
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Array of DAV responses
 */
export declare const todoMultiGet: (params: {
    url: string;
    props: ElementCompact;
    objectUrls?: string[];
    timezone?: string;
    depth: DAVDepth;
    filters?: ElementCompact;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
/**
 * Fetch VTODO objects from a CalDAV calendar with optional filtering
 *
 * @param params.calendar - Calendar to fetch todos from
 * @param params.objectUrls - Optional array of specific todo URLs to fetch
 * @param params.filters - Optional custom CalDAV filters
 * @param params.timeRange - Optional time range filter in ISO8601 format
 * @param params.expand - Whether to expand recurring todos
 * @param params.urlFilter - Custom filter function for todo object URLs
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.useMultiGet - Whether to use multiget (default: true)
 * @param params.fetchOptions - Fetch options
 * @returns Array of todo objects with url, etag, and iCalendar data
 * @throws Error if calendar URL is missing or timeRange format is invalid
 */
export declare const fetchTodos: (params: {
    calendar: DAVCalendar;
    objectUrls?: string[];
    filters?: ElementCompact;
    timeRange?: {
        start: string;
        end: string;
    };
    expand?: boolean;
    urlFilter?: (url: string) => boolean;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    useMultiGet?: boolean;
    fetchOptions?: RequestInit;
}) => Promise<DAVCalendarObject[]>;
/**
 * Create a new VTODO object in a CalDAV calendar
 *
 * @param params.calendar - Calendar to create the todo in
 * @param params.iCalString - iCalendar data string (must contain UID)
 * @param params.filename - Filename for the todo object
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 * @throws Error if iCalString does not contain a UID
 */
export declare const createTodo: (params: {
    calendar: DAVCalendar;
    iCalString: string;
    filename: string;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
/**
 * Update an existing VTODO object in a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to update (must have etag)
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 * @throws Error if calendarObject does not have an etag
 */
export declare const updateTodo: (params: {
    calendarObject: DAVCalendarObject;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
/**
 * Delete a VTODO object from a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to delete
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 */
export declare const deleteTodo: (params: {
    calendarObject: DAVCalendarObject;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
