---
sidebar_position: 5
---

## `todoQuery`

perform a CALDAV calendar-query filtered for VTODO objects

```ts
const responses = await todoQuery({
  url: 'https://caldav.example.com/calendar/',
  props: {
    'd:getetag': {},
    'c:calendar-data': {},
  },
  filters: {
    'comp-filter': {
      _attributes: { name: 'VCALENDAR' },
      'comp-filter': {
        _attributes: { name: 'VTODO' },
      },
    },
  },
  depth: '1',
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `url` calendar URL
- `props` [CALDAV prop element](https://datatracker.ietf.org/doc/html/rfc4791#section-9.6.4) in [ElementCompact](../types/ElementCompact.md) form
- `filters` [CALDAV filter element](https://datatracker.ietf.org/doc/html/rfc4791#section-9.7) in [ElementCompact](../types/ElementCompact.md) form
- `timezone` timezone string
- `depth` [DAVDepth](../types/DAVDepth.md)
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

array of [DAVResponse](../types/DAVResponse.md)

### Behavior

send a `REPORT` request with `calendar-query` body filtered for VTODO components
