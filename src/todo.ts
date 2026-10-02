import getLogger from 'debug';
import type { ElementCompact } from 'xml-js';

import {
  calendarMultiGet,
  calendarQuery,
  createCalendarObject,
  deleteCalendarObject,
  fetchCalendarObjects,
  updateCalendarObject,
} from './calendar';
import type { DAVDepth, DAVResponse } from './types/DAVTypes';
import type { DAVCalendar, DAVCalendarObject } from './types/models';
import { validateTimeRange } from './util/requestHelpers';

const debug = getLogger('tsdav:todo');

/*
 * VTODO support is a thin layer over the calendar-object API: a todo is a
 * calendar object whose component is VTODO. Delegating (instead of keeping a
 * parallel copy of the calendar code) means todos inherit every hardening the
 * calendar path gets — response validation, URL resolution, header handling.
 */

const toCalDAVDateTime = (value: string): string =>
  `${new Date(value).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`;

const buildTodoFilter = (timeRange?: { start: string; end: string }): ElementCompact => [
  {
    'comp-filter': {
      _attributes: { name: 'VCALENDAR' },
      'comp-filter': {
        _attributes: { name: 'VTODO' },
        ...(timeRange
          ? {
              'time-range': {
                _attributes: {
                  start: toCalDAVDateTime(timeRange.start),
                  end: toCalDAVDateTime(timeRange.end),
                },
              },
            }
          : {}),
      },
    },
  },
];

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
 * @param params.fetch - Optional fetch implementation to use instead of the default
 * @returns Array of DAV responses
 */
export const todoQuery = async (params: {
  url: string;
  props: ElementCompact;
  filters?: ElementCompact;
  timezone?: string;
  depth?: DAVDepth;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
  fetch?: typeof fetch;
}): Promise<DAVResponse[]> => calendarQuery(params);

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
 * @param params.fetch - Optional fetch implementation to use instead of the default
 * @returns Array of DAV responses
 */
export const todoMultiGet = async (params: {
  url: string;
  props: ElementCompact;
  objectUrls?: string[];
  timezone?: string;
  depth: DAVDepth;
  filters?: ElementCompact;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
  fetch?: typeof fetch;
}): Promise<DAVResponse[]> => calendarMultiGet(params);

/**
 * Fetch VTODO objects from a CalDAV calendar with optional filtering
 *
 * @param params.calendar - Calendar to fetch todos from
 * @param params.objectUrls - Optional array of specific todo URLs to fetch
 * @param params.filters - Optional custom CalDAV filters (replaces the default VTODO filter)
 * @param params.timeRange - Optional time range filter in ISO8601 format
 * @param params.expand - Whether to expand recurring todos (requires timeRange)
 * @param params.urlFilter - Custom filter function for todo object URLs
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.useMultiGet - Whether to use multiget (default: true)
 * @param params.fetchOptions - Fetch options
 * @param params.fetch - Optional fetch implementation to use instead of the default
 * @returns Array of todo objects with url, etag, and iCalendar data
 * @throws Error if calendar URL is missing or timeRange is invalid
 */
export const fetchTodos = async (params: {
  calendar: DAVCalendar;
  objectUrls?: string[];
  filters?: ElementCompact;
  timeRange?: { start: string; end: string };
  expand?: boolean;
  urlFilter?: (url: string) => boolean;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  useMultiGet?: boolean;
  fetchOptions?: RequestInit;
  fetch?: typeof fetch;
}): Promise<DAVCalendarObject[]> => {
  const { filters, timeRange, calendar } = params;
  if (timeRange) {
    validateTimeRange(timeRange);
  }
  debug(`Fetching todo objects from ${calendar?.url}`);
  if (!calendar?.url) {
    throw new Error('cannot fetchTodos for a calendar without url');
  }
  return fetchCalendarObjects({
    ...params,
    filters: filters ?? buildTodoFilter(timeRange),
  });
};

/**
 * Create a new VTODO object in a CalDAV calendar
 *
 * @param params.calendar - Calendar to create the todo in
 * @param params.iCalString - iCalendar data string (must contain UID)
 * @param params.filename - Filename for the todo object
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @param params.fetch - Optional fetch implementation to use instead of the default
 * @returns Response from the server
 * @throws Error if iCalString does not contain a UID
 */
export const createTodo = async (params: {
  calendar: DAVCalendar;
  iCalString: string;
  filename: string;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
  fetch?: typeof fetch;
}): Promise<Response> => {
  if (!params.iCalString.includes('UID:')) {
    throw new Error('iCalString must contain a UID');
  }
  return createCalendarObject(params);
};

/**
 * Update an existing VTODO object in a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to update (must have etag)
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @param params.fetch - Optional fetch implementation to use instead of the default
 * @returns Response from the server
 * @throws Error if calendarObject does not have an etag
 */
export const updateTodo = async (params: {
  calendarObject: DAVCalendarObject;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
  fetch?: typeof fetch;
}): Promise<Response> => {
  if (!params.calendarObject.etag) {
    throw new Error('calendarObject must have etag for update - fetch todo first');
  }
  return updateCalendarObject(params);
};

/**
 * Delete a VTODO object from a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to delete
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @param params.fetch - Optional fetch implementation to use instead of the default
 * @returns Response from the server
 */
export const deleteTodo = async (params: {
  calendarObject: DAVCalendarObject;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
  fetch?: typeof fetch;
}): Promise<Response> => deleteCalendarObject(params);
