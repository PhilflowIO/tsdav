---
sidebar_position: 1
---

## `fetchTodos`

get all/specified todos of the passed in calendar

```ts
const todos = await fetchTodos({
  calendar: calendars[0],
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `calendar` **required**, [DAVCalendar](../types/DAVCalendar.md) to fetch todos from
- `objectUrls` todo object urls to fetch
- `filters` [CALDAV filter element](https://datatracker.ietf.org/doc/html/rfc4791#section-9.7) in [ElementCompact](../types/ElementCompact.md) form
- `timeRange` time range in iso format
  - `start` start time in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601), format that's not in ISO 8601 will cause an error be thrown.
  - `end` end time in [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601), format that's not in ISO 8601 will cause an error be thrown.
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function
  :::info
  some calendar providers may return their objects with different suffix than .ics such as `http://api.xx/97ec5f81-5ecc-4505-9621-08806f6796a3` or `http://api.xx/todoobj1.abc`
  in this case, you need to pass in your own todo object name filter so that you can have results you need.
  :::
- `urlFilter` **default: function which only keep .ics objects** predicate function to filter urls from the todo objects before fetching
- `expand` whether to [expand](https://datatracker.ietf.org/doc/html/rfc4791#section-9.6.5) the todos, forcing the server to expand recurring components into individual todo objects.
  :::info
  some calendar providers may not support todoMultiGet, then it's necessary to use todoQuery to fetch todo data.
  :::
- `useMultiGet` **default: true** whether to use [todoMultiGet](./todoMultiGet.md) as underlying function to fetch todos, if set to false, it will use [todoQuery](./todoQuery.md) to fetch instead.

### Return Value

array of [DAVCalendarObject](../types/DAVCalendarObject.md)

### Behavior

a mix of [todoMultiGet](todoMultiGet.md) and [todoQuery](todoQuery.md), you can specify both filters and objectUrls here.
