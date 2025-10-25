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

- `todo` **required**, [DAVCalendarObject](../types/DAVCalendarObject.md) to update
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

[fetch api response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

### Behavior

use PUT request to update a todo object
