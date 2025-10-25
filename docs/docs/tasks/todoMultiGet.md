---
sidebar_position: 6
---

## `todoMultiGet`

perform a CALDAV calendar-multiget for specific VTODO objects

```ts
const responses = await todoMultiGet({
  url: 'https://caldav.example.com/calendar/',
  props: {
    'd:getetag': {},
    'c:calendar-data': {},
  },
  objectUrls: ['/calendar/task1.ics', '/calendar/task2.ics'],
  depth: '1',
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `url` calendar URL
- `props` [CALDAV prop element](https://datatracker.ietf.org/doc/html/rfc4791#section-9.6.4) in [ElementCompact](../types/ElementCompact.md) form
- `objectUrls` array of todo object URLs (paths) to fetch
- `timezone` timezone string
- `depth` [DAVDepth](../types/DAVDepth.md)
- `filters` [CALDAV filter element](https://datatracker.ietf.org/doc/html/rfc4791#section-9.7) in [ElementCompact](../types/ElementCompact.md) form
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

array of [DAVResponse](../types/DAVResponse.md)

### Behavior

send a `REPORT` request with `calendar-multiget` body to fetch multiple specific todo objects efficiently
