---
sidebar_position: 3
---

## `updateTodo`

update an existing todo object (VTODO)

```ts
await updateTodo({
  todo: {
    url: 'https://caldav.example.com/todos/task.ics',
    data: updatedICalString,
    etag: 'current-etag',
  },
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `todo` [DAVCalendarObject](../types/DAVCalendarObject.md) with updated data
  - `url` URL of the todo object
  - `data` updated todo data in iCal format
  - `etag` current ETag for concurrency control
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

`Response` from fetch api

### Behavior

use `PUT` to update todo object with `If-Match` header containing the ETag for optimistic concurrency control
