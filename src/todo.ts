/* eslint-disable no-underscore-dangle */
import getLogger from 'debug';
import { ElementCompact } from 'xml-js';

import { collectionQuery } from './collection';
import { DAVNamespace, DAVNamespaceShort } from './consts';
import { createObject, deleteObject, updateObject } from './request';
import { DAVDepth, DAVResponse } from './types/DAVTypes';
import { DAVAccount, DAVCalendar, DAVCalendarObject } from './types/models';
import {
  cleanupFalsy,
  excludeHeaders,
  getDAVAttribute,
} from './util/requestHelpers';
import { findMissingFieldNames, hasFields } from './util/typeHelpers';

const debug = getLogger('tsdav:todo');

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
    urlFilter = (url: string) => Boolean(url?.includes('.ics')),
    useMultiGet = true,
    headersToExclude,
    fetchOptions = {},
  } = params;

  if (timeRange) {
    // validate timeRange
    const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
    const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
    if (
      (!ISO_8601.test(timeRange.start) || !ISO_8601.test(timeRange.end)) &&
      (!ISO_8601_FULL.test(timeRange.start) || !ISO_8601_FULL.test(timeRange.end))
    ) {
      throw new Error('invalid timeRange format, not in ISO8601');
    }
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

  // default filter for VTODO
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
            ...(expand && timeRange
              ? {
                  [`${DAVNamespaceShort.CALDAV}:expand`]: {
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
        filters,
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
      })
    ).map((res) => res.href ?? '')
  )
    .map((url) => (url.startsWith('http') || !url ? url : new URL(url, calendar.url).href)) // patch up to full url if url is not full
    .filter(urlFilter) // custom filter function on todo objects
    .map((url) => new URL(url).pathname); // obtain pathname of the url

  let todoObjectResults: DAVResponse[] = [];

  if (todoObjectUrls.length > 0) {
    if (!useMultiGet || expand) {
      todoObjectResults = await todoQuery({
        url: calendar.url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
            ...(expand && timeRange
              ? {
                  [`${DAVNamespaceShort.CALDAV}:expand`]: {
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
            ...(expand && timeRange
              ? {
                  [`${DAVNamespaceShort.CALDAV}:expand`]: {
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

export const createTodo = async (params: {
  calendar: DAVCalendar;
  iCalString: string;
  filename: string;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
}): Promise<Response> => {
  const { calendar, iCalString, filename, headers, headersToExclude, fetchOptions = {} } = params;

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

export const updateTodo = async (params: {
  todo: DAVCalendarObject;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
}): Promise<Response> => {
  const { todo, headers, headersToExclude, fetchOptions = {} } = params;
  return updateObject({
    url: todo.url,
    data: todo.data,
    etag: todo.etag,
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

export const deleteTodo = async (params: {
  todo: DAVCalendarObject;
  headers?: Record<string, string>;
  headersToExclude?: string[];
  fetchOptions?: RequestInit;
}): Promise<Response> => {
  const { todo, headers, headersToExclude, fetchOptions = {} } = params;
  return deleteObject({
    url: todo.url,
    etag: todo.etag,
    headers: excludeHeaders(headers, headersToExclude),
    fetchOptions,
  });
};
