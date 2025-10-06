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

- `todo` **required**, [DAVCalendarObject](../types/DAVCalendarObject.md) to delete
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

[fetch api response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

### Behavior

use DELETE request to delete a todo object
