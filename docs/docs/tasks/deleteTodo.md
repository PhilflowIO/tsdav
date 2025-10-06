---
sidebar_position: 4
---

## `deleteTodo`

delete a todo object (VTODO)

```ts
await deleteTodo({
  todo: {
    url: 'https://caldav.example.com/todos/task.ics',
    etag: 'current-etag',
  },
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `todo` [DAVCalendarObject](../types/DAVCalendarObject.md)
  - `url` URL of the todo object to delete
  - `etag` current ETag for concurrency control
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

`Response` from fetch api

### Behavior

use `DELETE` to remove todo object with `If-Match` header containing the ETag for optimistic concurrency control
