import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as request from '../../request';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  todoMultiGet,
  todoQuery,
  updateTodo,
} from '../../todo';

vi.mock('../../request');

const mockedDavRequest = request.davRequest as vi.MockedFunction<typeof request.davRequest>;
const mockedCreateObject = request.createObject as vi.MockedFunction<typeof request.createObject>;
const mockedUpdateObject = request.updateObject as vi.MockedFunction<typeof request.updateObject>;
const mockedDeleteObject = request.deleteObject as vi.MockedFunction<typeof request.deleteObject>;

describe('todo fetch override', () => {
  const customFetch = vi.fn() as unknown as typeof fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedDavRequest.mockResolvedValue([]);
  });

  it('todoQuery should forward a custom fetch to davRequest', async () => {
    await todoQuery({
      url: 'http://example.com/cal/',
      props: {},
      fetch: customFetch,
    });

    expect(mockedDavRequest.mock.calls[0][0].fetch).toBe(customFetch);
  });

  it('todoMultiGet should forward a custom fetch to davRequest', async () => {
    await todoMultiGet({
      url: 'http://example.com/cal/',
      props: {},
      depth: '1',
      fetch: customFetch,
    });

    expect(mockedDavRequest.mock.calls[0][0].fetch).toBe(customFetch);
  });

  it('fetchTodos should forward a custom fetch through its internal query', async () => {
    await fetchTodos({
      calendar: { url: 'http://example.com/cal/' },
      fetch: customFetch,
    });

    expect(mockedDavRequest).toHaveBeenCalled();
    mockedDavRequest.mock.calls.forEach((call) => {
      expect(call[0].fetch).toBe(customFetch);
    });
  });

  it('createTodo should forward a custom fetch to createObject', async () => {
    await createTodo({
      calendar: { url: 'http://example.com/cal/' },
      iCalString: 'BEGIN:VCALENDAR\nBEGIN:VTODO\nUID:1\nEND:VTODO\nEND:VCALENDAR',
      filename: '1.ics',
      fetch: customFetch,
    });

    expect(mockedCreateObject.mock.calls[0][0].fetch).toBe(customFetch);
  });

  it('updateTodo should forward a custom fetch to updateObject', async () => {
    await updateTodo({
      calendarObject: { url: 'http://example.com/cal/1.ics', etag: '"1"', data: '' },
      fetch: customFetch,
    });

    expect(mockedUpdateObject.mock.calls[0][0].fetch).toBe(customFetch);
  });

  it('deleteTodo should forward a custom fetch to deleteObject', async () => {
    await deleteTodo({
      calendarObject: { url: 'http://example.com/cal/1.ics', etag: '"1"', data: '' },
      fetch: customFetch,
    });

    expect(mockedDeleteObject.mock.calls[0][0].fetch).toBe(customFetch);
  });

  it('should leave fetch undefined when no override is given', async () => {
    await todoQuery({ url: 'http://example.com/cal/', props: {} });

    expect(mockedDavRequest.mock.calls[0][0].fetch).toBeUndefined();
  });
});

describe('fetchTodos request shape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedDavRequest.mockResolvedValue([]);
  });

  it('queries VTODO components, not VEVENT', async () => {
    await fetchTodos({ calendar: { url: 'http://example.com/cal/' } });

    const body = JSON.stringify(mockedDavRequest.mock.calls[0][0].init.body);
    expect(body).toContain('"name":"VTODO"');
    expect(body).not.toContain('"name":"VEVENT"');
  });

  it('adds the time-range to the VTODO filter', async () => {
    await fetchTodos({
      calendar: { url: 'http://example.com/cal/' },
      timeRange: { start: '2026-01-01T00:00:00Z', end: '2026-02-01T00:00:00Z' },
    });

    const body = JSON.stringify(mockedDavRequest.mock.calls[0][0].init.body);
    expect(body).toContain('"start":"20260101T000000Z"');
    expect(body).toContain('"end":"20260201T000000Z"');
  });

  it('rejects an inverted time-range before any request', async () => {
    await expect(
      fetchTodos({
        calendar: { url: 'http://example.com/cal/' },
        timeRange: { start: '2026-02-01T00:00:00Z', end: '2026-01-01T00:00:00Z' },
      }),
    ).rejects.toThrow('start must be before end');
    expect(mockedDavRequest).not.toHaveBeenCalled();
  });
});
