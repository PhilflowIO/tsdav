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

- `calendar` **required**, the [DAVCalendar](../types/DAVCalendar.md) which the client wish to create object on.
- `filename` **required**, file name of the new todo object, should end in `.ics`
- `iCalString` **required**, todo data in iCal format (must contain VTODO component)
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

### Return Value

[fetch api response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

### Behavior

use PUT request to create a new todo object
