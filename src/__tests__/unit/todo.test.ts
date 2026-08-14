import * as request from '../../request';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  todoMultiGet,
  todoQuery,
  updateTodo,
} from '../../todo';

jest.mock('../../request');

const mockedDavRequest = request.davRequest as jest.MockedFunction<typeof request.davRequest>;
const mockedCreateObject = request.createObject as jest.MockedFunction<typeof request.createObject>;
const mockedUpdateObject = request.updateObject as jest.MockedFunction<typeof request.updateObject>;
const mockedDeleteObject = request.deleteObject as jest.MockedFunction<typeof request.deleteObject>;

describe('todo fetch override', () => {
  const customFetch = jest.fn() as unknown as typeof fetch;

  beforeEach(() => {
    jest.clearAllMocks();
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
