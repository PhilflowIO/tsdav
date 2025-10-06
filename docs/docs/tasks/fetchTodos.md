---
sidebar_position: 1
---

## `fetchTodos`

get all todo objects (VTODO) from the passed in calendar

```ts
const todos = await fetchTodos({
  calendar,
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `calendar` [DAVCalendar](../types/DAVCalendar.md)
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function
- `objectUrls` array of todo object urls to fetch
- `filters` [CALDAV filter element](https://datatracker.ietf.org/doc/html/rfc4791#section-9.7) in [ElementCompact](../types/ElementCompact.md) form, overriding default VTODO filter
- `timeRange` time range filter object with `start` and `end` ISO8601 date strings
- `urlFilter` function to filter todo URLs
- `useMultiGet` whether to use calendar-multiget for better performance (default: true)

### Return Value

array of [DAVCalendarObject](../types/DAVCalendarObject.md) containing todo data in iCal format

### Behavior

use `calendar-query` with VTODO filter to fetch all todos from a calendar, or `calendar-multiget` if specific URLs are provided
