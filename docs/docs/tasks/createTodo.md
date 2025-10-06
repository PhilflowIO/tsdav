---
sidebar_position: 2
---

## `createTodo`

create a new todo object (VTODO) in the passed in calendar

```ts
await createTodo({
  calendar,
  filename: 'my-task.ics',
  iCalString: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MyApp//EN
BEGIN:VTODO
UID:unique-id@example.com
DTSTAMP:20240101T120000Z
SUMMARY:My Task
STATUS:NEEDS-ACTION
END:VTODO
END:VCALENDAR`,
  headers: {
    authorization: 'Basic x0C9uFWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `calendar` [DAVCalendar](../types/DAVCalendar.md)
- `iCalString` todo data in iCal format (must contain VTODO component)
- `filename` filename for the new todo object (e.g., 'task.ics')
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

`Response` from fetch api

### Behavior

use `PUT` to create new todo object at the specified URL with `If-None-Match: *` header to prevent overwriting existing objects
