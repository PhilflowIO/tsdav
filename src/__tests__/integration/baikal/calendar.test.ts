import fsp from 'fs/promises';

import { createAccount } from '../../../account';
import { calendarMultiGet, fetchCalendarObjects, fetchCalendars } from '../../../calendar';
import { DAVNamespace } from '../../../consts';
import { createObject, deleteObject } from '../../../request';
import { DAVAccount } from '../../../types/models';
import { getBasicAuthHeaders } from '../../../util/authHelpers';

let authHeaders: {
  authorization?: string;
};

let account: DAVAccount;

beforeAll(async () => {
  authHeaders = getBasicAuthHeaders({
    username: process.env.CREDENTIAL_BAIKAL_USERNAME,
    password: process.env.CREDENTIAL_BAIKAL_PASSWORD,
  });
  account = await createAccount({
    account: {
      serverUrl: `${process.env.CREDENTIAL_BAIKAL_SERVER_URL}/dav.php`,
      accountType: 'caldav',
    },
    headers: authHeaders,
  });
});

test('fetchCalendars should be able to fetch calendars', async () => {
  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });
  expect(calendars.length > 0).toBe(true);
  expect(calendars.every((c) => c.url.length > 0)).toBe(true);
});

test('calendarMultiGet should be able to get information about multiple calendar objects', async () => {
  const iCalString1 = await fsp.readFile(`${__dirname}/../data/ical/1.ics`, 'utf-8');
  const iCalString2 = await fsp.readFile(`${__dirname}/../data/ical/2.ics`, 'utf-8');
  const iCalString3 = await fsp.readFile(`${__dirname}/../data/ical/3.ics`, 'utf-8');
  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });

  const objectUrl1 = new URL('1.ics', calendars[0].url).href;
  const objectUrl2 = new URL('2.ics', calendars[0].url).href;
  const objectUrl3 = new URL('3.ics', calendars[0].url).href;

  const response1 = await createObject({
    url: objectUrl1,
    data: iCalString1,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  const response2 = await createObject({
    url: objectUrl2,
    data: iCalString2,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  const response3 = await createObject({
    url: objectUrl3,
    data: iCalString3,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  expect(response1.ok).toBe(true);
  expect(response2.ok).toBe(true);
  expect(response3.ok).toBe(true);

  const calendarObjects = await calendarMultiGet({
    url: calendars[0].url,
    props: [
      { name: 'getetag', namespace: DAVNamespace.DAV },
      { name: 'calendar-data', namespace: DAVNamespace.CALDAV },
    ],
    depth: '1',
    headers: authHeaders,
  });

  expect(calendarObjects.length > 0);

  const deleteResult1 = await deleteObject({
    url: objectUrl1,
    headers: authHeaders,
  });

  const deleteResult2 = await deleteObject({
    url: objectUrl2,
    headers: authHeaders,
  });

  const deleteResult3 = await deleteObject({
    url: objectUrl3,
    headers: authHeaders,
  });

  expect(deleteResult1.ok).toBe(true);
  expect(deleteResult2.ok).toBe(true);
  expect(deleteResult3.ok).toBe(true);
});

test('fetchCalendarObjects should be able to fetch calendar objects', async () => {
  const iCalString1 = await fsp.readFile(`${__dirname}/../data/ical/4.ics`, 'utf-8');

  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });

  const objectUrl1 = new URL('test20.ics', calendars[0].url).href;
  await createObject({
    url: objectUrl1,
    data: iCalString1,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  const objects = await fetchCalendarObjects({
    calendar: calendars[0],
    headers: authHeaders,
  });

  expect(objects.length > 0).toBe(true);
  expect(
    objects.every((o) => o.data?.length > 0 && (o.etag?.length ?? 0) > 0 && o.url?.length > 0),
  ).toBe(true);

  await deleteObject({
    url: objectUrl1,
    headers: authHeaders,
  });
});

test('fetchCalendarObjects should be able to fetch target calendar objects when specified timeRange', async () => {
  const iCalString1 = await fsp.readFile(`${__dirname}/../data/ical/5.ics`, 'utf-8');
  const iCalString2 = await fsp.readFile(`${__dirname}/../data/ical/6.ics`, 'utf-8');
  const iCalString3 = await fsp.readFile(`${__dirname}/../data/ical/7.ics`, 'utf-8');
  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });

  const objectUrl1 = new URL('5.ics', calendars[0].url).href;
  const objectUrl2 = new URL('6.ics', calendars[0].url).href;
  const objectUrl3 = new URL('7.ics', calendars[0].url).href;

  const response1 = await createObject({
    url: objectUrl1,
    data: iCalString1,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  const response2 = await createObject({
    url: objectUrl2,
    data: iCalString2,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  const response3 = await createObject({
    url: objectUrl3,
    data: iCalString3,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  expect(response1.ok).toBe(true);
  expect(response2.ok).toBe(true);
  expect(response3.ok).toBe(true);

  const objects = await fetchCalendarObjects({
    calendar: calendars[0],
    headers: authHeaders,
    timeRange: {
      start: '2021-05-01T00:00:00.000Z',
      end: '2021-05-04T00:00:00.000Z',
    },
  });

  expect(objects.length).toBe(1);
  expect(objects[0].url).toEqual(objectUrl3);

  const deleteResult1 = await deleteObject({
    url: objectUrl1,
    headers: authHeaders,
  });

  const deleteResult2 = await deleteObject({
    url: objectUrl2,
    headers: authHeaders,
  });

  const deleteResult3 = await deleteObject({
    url: objectUrl3,
    headers: authHeaders,
  });

  expect(deleteResult1.ok).toBe(true);
  expect(deleteResult2.ok).toBe(true);
  expect(deleteResult3.ok).toBe(true);
});

test('fetchCalendarObjects should return empty result when no objects fall in the range', async () => {
  const iCalString1 = await fsp.readFile(`${__dirname}/../data/ical/13.ics`, 'utf-8');
  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });

  const objectUrl1 = new URL('13.ics', calendars[0].url).href;

  const response1 = await createObject({
    url: objectUrl1,
    data: iCalString1,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });

  expect(response1.ok).toBe(true);

  const objects = await fetchCalendarObjects({
    calendar: calendars[0],
    headers: authHeaders,
    timeRange: {
      start: '2022-03-11T10:00:00.000Z',
      end: '2022-03-11T11:00:00.000Z',
    },
    expand: true,
  });

  expect(objects.length).toBe(0);

  const deleteResult1 = await deleteObject({
    url: objectUrl1,
    headers: authHeaders,
  });

  expect(deleteResult1.ok).toBe(true);
});

test('fetchCalendarObjects should fail when passed timeRange is invalid', async () => {
  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });
  const t = () =>
    fetchCalendarObjects({
      calendar: calendars[0],
      headers: authHeaders,
      timeRange: {
        start: 'Sat May 01 2021 00:00:00 GMT+0800',
        end: 'Sat May 04 2021 00:00:00 GMT+0800',
      },
    });

  expect(t()).rejects.toEqual(new Error('invalid timeRange format, not in ISO8601'));
});

test('updateEventFields should update calendar event fields and auto-increment SEQUENCE', async () => {
  // Import the new field updater
  const { updateEventFields } = await import('../../../util/calendarFieldUpdater');
  const { updateCalendarObject } = await import('../../../calendar');

  const iCalString = await fsp.readFile(`${__dirname}/../data/ical/1.ics`, 'utf-8');
  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });

  // Create a test event
  const objectUrl = new URL('field-update-test.ics', calendars[0].url).href;
  const createResponse = await createObject({
    url: objectUrl,
    data: iCalString,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      ...authHeaders,
    },
  });
  expect(createResponse.ok).toBe(true);

  // Fetch the event back
  let objects = await fetchCalendarObjects({
    calendar: calendars[0],
    headers: authHeaders,
  });

  const event = objects.find((o) => o.url === objectUrl);
  expect(event).toBeTruthy();

  if (event) {
    // Update using field-based updater
    const updated = updateEventFields(event, {
      SUMMARY: 'Updated via Field Updater',
      DESCRIPTION: 'This event was updated using the new field-based update API'
    });

    expect(updated.modified).toBe(true);
    expect(updated.data).toContain('SUMMARY:Updated via Field Updater');
    expect(updated.metadata?.sequence).toBeGreaterThanOrEqual(0);

    // Send update to server
    const updateResponse = await updateCalendarObject({
      calendarObject: {
        ...event,
        data: updated.data
      },
      headers: authHeaders,
    });

    expect(updateResponse.ok).toBe(true);

    // Fetch back and verify
    objects = await fetchCalendarObjects({
      calendar: calendars[0],
      headers: authHeaders,
    });

    const refetchedEvent = objects.find((o) => o.url === objectUrl);
    expect(refetchedEvent?.data).toContain('SUMMARY:Updated via Field Updater');
    expect(refetchedEvent?.data).toContain('DESCRIPTION:This event was updated using the new field-based update API');
  }

  // Cleanup
  const deleteResult = await deleteObject({
    url: objectUrl,
    headers: authHeaders,
  });
  expect(deleteResult.ok).toBe(true);
});
