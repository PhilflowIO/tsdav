import { describe, expect, it, vi } from 'vitest';

import { createDAVClient, DAVClient } from '../../client';
import { deleteObject } from '../../request';
import { defaultParam, getBasicAuthHeaders } from '../../util/authHelpers';

/*
 * Regression for PhilflowIO/dav-mcp#72: a caller passing its own `headers`
 * (e.g. a Content-Type) used to replace the client's auth headers instead of
 * merging with them, so the DELETE went out without `authorization` and the
 * server answered 401.
 */

const credentials = { username: 'user', password: 'secret' };
const expectedAuthorization = getBasicAuthHeaders(credentials).authorization;
const objectUrl = 'https://dav.example.com/cal/event.ics';
const callerHeaders = { 'Content-Type': 'text/calendar; charset=utf-8' };

const buildFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
    statusText: 'No Content',
    text: vi.fn().mockResolvedValue(''),
    headers: new Map(),
  });

const sentHeaders = (fetchMock: ReturnType<typeof buildFetch>): Record<string, string> => {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(objectUrl);
  expect(init.method).toBe('DELETE');
  return Object.fromEntries(
    Object.entries(init.headers as Record<string, string>).map(([k, v]) => [k.toLowerCase(), v]),
  );
};

const loggedInClient = async (fetchMock: ReturnType<typeof buildFetch>): Promise<DAVClient> => {
  const client = new DAVClient({
    serverUrl: 'https://dav.example.com',
    credentials,
    authMethod: 'Basic',
    fetch: fetchMock as unknown as typeof fetch,
  });
  // Skip account discovery so login() only resolves auth headers (as dav-mcp does before any call).
  (client as unknown as { accountType?: string }).accountType = undefined;
  await client.login();
  return client;
};

describe('caller headers merge with auth headers (dav-mcp#72)', () => {
  it('defaultParam-wrapped deleteObject keeps authorization when caller passes headers', async () => {
    const fetchMock = buildFetch();
    const boundDelete = defaultParam(deleteObject, {
      headers: getBasicAuthHeaders(credentials),
      fetch: fetchMock as unknown as typeof fetch,
    });

    await boundDelete({ url: objectUrl, etag: '"1"', headers: callerHeaders });

    const headers = sentHeaders(fetchMock);
    expect(headers.authorization).toBe(expectedAuthorization);
    expect(headers['content-type']).toBe(callerHeaders['Content-Type']);
    expect(headers['if-match']).toBe('"1"');
  });

  it('DAVClient.deleteObject keeps authorization when caller passes headers', async () => {
    const fetchMock = buildFetch();
    const client = await loggedInClient(fetchMock);

    await client.deleteObject({ url: objectUrl, headers: callerHeaders });

    const headers = sentHeaders(fetchMock);
    expect(headers.authorization).toBe(expectedAuthorization);
    expect(headers['content-type']).toBe(callerHeaders['Content-Type']);
  });

  it('createDAVClient deleteObject keeps authorization when caller passes headers', async () => {
    const fetchMock = buildFetch();
    const client = await createDAVClient({
      serverUrl: 'https://dav.example.com',
      credentials,
      authMethod: 'Basic',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.deleteObject({ url: objectUrl, headers: callerHeaders });

    const headers = sentHeaders(fetchMock);
    expect(headers.authorization).toBe(expectedAuthorization);
    expect(headers['content-type']).toBe(callerHeaders['Content-Type']);
  });

  it('a caller-supplied authorization header still wins (case-insensitive override)', async () => {
    const fetchMock = buildFetch();
    const client = await loggedInClient(fetchMock);

    await client.deleteObject({ url: objectUrl, headers: { Authorization: 'Bearer override' } });

    const headers = sentHeaders(fetchMock);
    expect(headers.authorization).toBe('Bearer override');
  });
});
