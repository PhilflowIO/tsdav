/* eslint-disable no-underscore-dangle */
import getLogger from 'debug';
import { ElementCompact } from 'xml-js';

import { collectionQuery } from './collection';
import { DAVNamespace, DAVNamespaceShort } from './consts';
import { createObject, deleteObject, updateObject } from './request';
import { DAVDepth, DAVResponse } from './types/DAVTypes';
import { DAVCalendar, DAVCalendarObject } from './types/models';
import {
  cleanupFalsy,
  defaultIcsFilter,
  excludeHeaders,
  getDAVAttribute,
  validateISO8601TimeRange,
} from './util/requestHelpers';
import { findMissingFieldNames, hasFields } from './util/typeHelpers';

const debug = getLogger('tsdav:todo');

/**
 * Helper function to build expand property for calendar-data
 */
const buildExpandProp = (timeRange: { start: string; end: string }): ElementCompact => ({
  [`${DAVNamespaceShort.CALDAV}:expand`]: {
    _attributes: {
      start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`,
      end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`,
    },
  },
});

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
export const todoQuery = async (params: {
  url: string;
  props: ElementCompact;
  filters?: ElementCompact;
  timezone?: string;
  depth?: DAVDepth;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
}): Promise<DAVResponse[]> => {
  const {
    url,
    props,
    filters,
    timezone,
    depth,
    headers,
    headersToExclude,
    fetchOptions = {},
  } = params;
  return collectionQuery({
    url,
    body: {
      'calendar-query': cleanupFalsy({
        _attributes: getDAVAttribute([
          DAVNamespace.CALDAV,
          DAVNamespace.CALENDAR_SERVER,
          DAVNamespace.CALDAV_APPLE,
          DAVNamespace.DAV,
        ]),
        [`${DAVNamespaceShort.DAV}:prop`]: props,
        filter: filters,
        timezone,
      }),
    },
    defaultNamespace: DAVNamespaceShort.CALDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
  });
};

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
}): Promise<DAVResponse[]> => {
  const {
    url,
    props,
    objectUrls,
    filters,
    timezone,
    depth,
    headers,
    headersToExclude,
    fetchOptions = {},
  } = params;
  return collectionQuery({
    url,
    body: {
      'calendar-multiget': cleanupFalsy({
        _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CALDAV]),
        [`${DAVNamespaceShort.DAV}:prop`]: props,
        [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
        filter: filters,
        timezone,
      }),
    },
    defaultNamespace: DAVNamespaceShort.CALDAV,
    depth,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
  });
};

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
}): Promise<DAVCalendarObject[]> => {
  const {
    calendar,
    objectUrls,
    filters: customFilters,
    timeRange,
    headers,
    expand,
    urlFilter = defaultIcsFilter,
    useMultiGet = true,
    headersToExclude,
    fetchOptions = {},
  } = params;

  if (timeRange) {
    validateISO8601TimeRange(timeRange.start, timeRange.end);
  }

  debug(`Fetching todo objects from ${calendar?.url}`);
  const requiredFields: Array<'url'> = ['url'];
  if (!calendar || !hasFields(calendar, requiredFields)) {
    if (!calendar) {
      throw new Error('cannot fetchTodos for undefined calendar');
    }
    throw new Error(
      `calendar must have ${findMissingFieldNames(
        calendar,
        requiredFields,
      )} before fetchTodos`,
    );
  }

  // Build CalDAV filter for VTODO components
  // Structure: VCALENDAR -> VTODO -> optional time-range
  const filters: ElementCompact = customFilters ?? [
    {
      'comp-filter': {
        _attributes: {
          name: 'VCALENDAR',
        },
        'comp-filter': {
          _attributes: {
            name: 'VTODO',
          },
          ...(timeRange
            ? {
                'time-range': {
                  _attributes: {
                    start: `${new Date(timeRange.start)
                      .toISOString()
                      .slice(0, 19)
                      .replace(/[-:.]/g, '')}Z`,
                    end: `${new Date(timeRange.end)
                      .toISOString()
                      .slice(0, 19)
                      .replace(/[-:.]/g, '')}Z`,
                  },
                },
              }
            : {}),
        },
      },
    },
  ];

  const todoObjectUrls = (
    objectUrls ??
    // fetch all todo objects of the calendar
    (
      await todoQuery({
        url: calendar.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {
            ...(expand && timeRange ? buildExpandProp(timeRange) : {}),
          },
        },
        filters,
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
      })
    ).map((res) => res.href ?? '')
  )
    .map((url) => (url.startsWith('http') || !url ? url : new URL(url, calendar.url).href))
    .filter(urlFilter)
    .map((url) => new URL(url).pathname);

  let todoObjectResults: DAVResponse[] = [];

  if (todoObjectUrls.length > 0) {
    if (!useMultiGet || expand) {
      todoObjectResults = await todoQuery({
        url: calendar.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
            ...(expand && timeRange ? buildExpandProp(timeRange) : {}),
          },
        },
        filters,
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
      });
    } else {
      todoObjectResults = await todoMultiGet({
        url: calendar.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
            ...(expand && timeRange ? buildExpandProp(timeRange) : {}),
          },
        },
        objectUrls: todoObjectUrls,
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
      });
    }
  }

  return todoObjectResults.map((res) => ({
    url: new URL(res.href ?? '', calendar.url).href,
    etag: `${res.props?.getetag}`,
    data: res.props?.calendarData?._cdata ?? res.props?.calendarData,
  }));
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
}): Promise<Response> => {
  const { calendar, iCalString, filename, headers, headersToExclude, fetchOptions = {} } = params;

  if (!iCalString.includes('UID:')) {
    throw new Error('iCalString must contain a UID');
  }

  return createObject({
    url: new URL(filename, calendar.url).href,
    data: iCalString,
    headers: excludeHeaders(
      {
        'content-type': 'text/calendar; charset=utf-8',
        'If-None-Match': '*',
        ...headers,
      },
      headersToExclude,
    ),
    fetchOptions,
  });
};

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
export const updateTodo = async (params: {
  calendarObject: DAVCalendarObject;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
}): Promise<Response> => {
  const { calendarObject, headers, headersToExclude, fetchOptions = {} } = params;

  if (!calendarObject.etag) {
    throw new Error('calendarObject must have etag for update - fetch todo first');
  }

  return updateObject({
    url: calendarObject.url,
    data: calendarObject.data,
    etag: calendarObject.etag,
    headers: excludeHeaders(
      {
        'content-type': 'text/calendar; charset=utf-8',
        ...headers,
      },
      headersToExclude,
    ),
    fetchOptions,
  });
};

/**
 * Delete a VTODO object from a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to delete
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 */
export const deleteTodo = async (params: {
  calendarObject: DAVCalendarObject;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
}): Promise<Response> => {
  const { calendarObject, headers, headersToExclude, fetchOptions = {} } = params;
  return deleteObject({
    url: calendarObject.url,
    etag: calendarObject.etag,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
  });
};
