import { vi, describe, it, expect } from 'vitest';
import { createAccount, fetchPrincipalUrl } from '../../account';
import { collectionQuery, smartCollectionSyncDetailed } from '../../collection';
import { fetchCalendarUserAddresses } from '../../calendar';
import { assertDAVResponses } from '../../util/responseHelpers';
import { createDAVClient } from '../../client';
import { getOauthHeaders } from '../../util/authHelpers';
import * as tsdav from '../../index';

const response = (
  status: number,
  statusText = '',
  body = '',
  headers: Record<string, string> = {},
) => {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
    text: vi.fn().mockResolvedValue(body),
    json: vi.fn().mockResolvedValue(body ? JSON.parse(body) : {}),
  };
};

describe('DAVAuthenticationError', () => {
  it('is exported with its guard', () => {
    expect(typeof tsdav.DAVAuthenticationError).toBe('function');
    expect(typeof tsdav.isDAVAuthenticationError).toBe('function');
  });

  it('fetchPrincipalUrl throws it on 401, with status, URL and the old message', async () => {
    const error = await fetchPrincipalUrl({
      account: {
        serverUrl: 'https://example.com/',
        rootUrl: 'https://example.com/dav/',
        accountType: 'caldav',
      },
      fetch: vi.fn().mockResolvedValue(response(401, 'Unauthorized')),
    }).catch((e) => e);

    expect(error).toBeInstanceOf(tsdav.DAVAuthenticationError);
    expect(error).toBeInstanceOf(Error);
    expect(tsdav.isDAVAuthenticationError(error)).toBe(true);
    expect(error.code).toBe('TSDAV_AUTHENTICATION_FAILED');
    expect(error.status).toBe(401);
    expect(error.url).toBe('https://example.com/dav/');
    expect(error.message).toBe(
      'Invalid credentials: PROPFIND https://example.com/dav/ returned 401 Unauthorized',
    );
  });

  it('a non-401 failure is not an authentication error', async () => {
    const error = await fetchPrincipalUrl({
      account: {
        serverUrl: 'https://example.com/',
        rootUrl: 'https://example.com/',
        accountType: 'caldav',
      },
      fetch: vi.fn().mockResolvedValue(response(405, 'Method Not Allowed')),
    }).catch((e) => e);

    expect(tsdav.isDAVAuthenticationError(error)).toBe(false);
  });

  it('createAccount keeps the 401 when a later root candidate answers 405 (Baikal)', async () => {
    const fetch = vi.fn(async (url: string) => {
      if (url.includes('/.well-known/')) return response(404, 'Not Found');
      if (url === 'https://example.com/') return response(405, 'Method Not Allowed');
      return response(401, 'Unauthorized');
    });

    const error = await createAccount({
      account: { serverUrl: 'https://example.com/dav.php/', accountType: 'caldav' },
      fetch,
    }).catch((e) => e);

    expect(tsdav.isDAVAuthenticationError(error)).toBe(true);
    expect(error.status).toBe(401);
    expect(error.url).toBe('https://example.com/dav.php/');
  });

  it('a token endpoint refusing the grant is an authentication error with its status and URL', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response(400, 'Bad Request', '{"error":"invalid_grant"}'));

    const error = await createDAVClient({
      serverUrl: 'https://example.com/',
      credentials: {
        refreshToken: 'revoked',
        clientId: 'cid',
        clientSecret: 'secret',
        tokenUrl: 'https://oauth.example.com/token',
      },
      authMethod: 'Oauth',
      fetch,
    }).catch((e) => e);

    expect(tsdav.isDAVAuthenticationError(error)).toBe(true);
    expect(error.status).toBe(400);
    expect(error.url).toBe('https://oauth.example.com/token');
    expect(error.message).toBe(
      'OAuth authentication failed: token endpoint returned no access token',
    );
  });

  it.each([
    [503, 'Service Unavailable'],
    [429, 'Too Many Requests'],
    [404, 'Not Found'],
  ])(
    'a token endpoint answering %i is a DAVResponseError with that status, not a refused login',
    async (status, statusText) => {
      const fetch = vi.fn().mockResolvedValue(response(status, statusText));

      const error = await createDAVClient({
        serverUrl: 'https://example.com/',
        credentials: {
          refreshToken: 'r',
          clientId: 'cid',
          clientSecret: 'secret',
          tokenUrl: 'https://oauth.example.com/token',
        },
        authMethod: 'Oauth',
        fetch,
      }).catch((e) => e);

      expect(tsdav.isDAVAuthenticationError(error)).toBe(false);
      expect(tsdav.isDAVResponseError(error)).toBe(true);
      expect(error.status).toBe(status);
      expect(error.url).toBe('https://oauth.example.com/token');
      expect(error.message).toBe(
        'OAuth authentication failed: token endpoint returned no access token',
      );
    },
  );

  it('the authorization-code grant refused with 400 is an authentication error', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response(400, 'Bad Request', '{"error":"invalid_grant"}'));

    const error = await createDAVClient({
      serverUrl: 'https://example.com/',
      credentials: {
        authorizationCode: 'used-up',
        redirectUrl: 'http://localhost/callback',
        clientId: 'cid',
        clientSecret: 'secret',
        tokenUrl: 'https://oauth.example.com/token',
      },
      authMethod: 'Oauth',
      fetch,
    }).catch((e) => e);

    expect(tsdav.isDAVAuthenticationError(error)).toBe(true);
    expect(error.status).toBe(400);
  });

  it('getOauthHeaders keeps its return fields on success', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response(200, 'OK', '{"access_token":"a","expires_in":60}'));
    const result = await getOauthHeaders(
      { refreshToken: 'r', clientId: 'c', clientSecret: 's', tokenUrl: 'https://t/' },
      {},
      fetch,
    );

    expect(Object.keys(result).sort()).toEqual(['headers', 'tokens']);
    expect(result.headers).toEqual({ authorization: 'Bearer a' });
  });
});

describe('DAVResponseError', () => {
  it('is exported with its guard; an authentication error is one too', () => {
    expect(typeof tsdav.DAVResponseError).toBe('function');
    const auth = new tsdav.DAVAuthenticationError('x', { status: 401, url: 'https://e/' });
    expect(auth).toBeInstanceOf(tsdav.DAVResponseError);
    expect(tsdav.isDAVResponseError(auth)).toBe(true);
  });

  it('the guards accept a copy from another bundle by its code', () => {
    const copy = Object.assign(new Error('x'), {
      code: 'TSDAV_RESPONSE_ERROR',
      status: 500,
      url: 'u',
    });
    expect(tsdav.isDAVResponseError(copy)).toBe(true);
    expect(tsdav.isDAVAuthenticationError(copy)).toBe(false);
  });

  it.each([
    [401, true],
    [403, false],
    [500, false],
  ])(
    'assertDAVResponses: %i keeps its message and status (401 is a refused login: %s)',
    (status, auth) => {
      const error = (() => {
        try {
          assertDAVResponses(
            [{ ok: false, status, statusText: 'Nope', href: 'https://example.com/cal/' } as never],
            'Calendar discovery failed',
          );
        } catch (e) {
          return e as never as { message: string; status: number; url: string };
        }
        throw new Error('did not throw');
      })();

      expect(error.message).toBe(`Calendar discovery failed: ${status} Nope`);
      expect(tsdav.isDAVResponseError(error)).toBe(true);
      expect(tsdav.isDAVAuthenticationError(error)).toBe(auth);
      expect(error.status).toBe(status);
      expect(error.url).toBe('https://example.com/cal/');
    },
  );

  it('collectionQuery: a 401 is an authentication error with the old message', async () => {
    const fetch = vi.fn().mockResolvedValue(response(401, 'Unauthorized', '"no"'));

    const error = await collectionQuery({
      url: 'https://example.com/cal/',
      body: { 'c:calendar-query': {} },
      fetch,
    }).catch((e) => e);

    expect(error.message.startsWith('Collection query failed: 401 Unauthorized.')).toBe(true);
    expect(tsdav.isDAVAuthenticationError(error)).toBe(true);
    expect(error.status).toBe(401);
  });

  it('fetchPrincipalUrl: a 403 keeps its status, so forbidden reads apart from "not a DAV server"', async () => {
    const error = await fetchPrincipalUrl({
      account: {
        serverUrl: 'https://example.com/',
        rootUrl: 'https://example.com/dav/',
        accountType: 'caldav',
      },
      fetch: vi.fn().mockResolvedValue(response(403, 'Forbidden')),
    }).catch((e) => e);

    expect(error.message).toBe('cannot find principalUrl');
    expect(tsdav.isDAVResponseError(error)).toBe(true);
    expect(tsdav.isDAVAuthenticationError(error)).toBe(false);
    expect(error.status).toBe(403);
    expect(error.url).toBe('https://example.com/dav/');
  });

  it.each([
    [401, true],
    [403, false],
  ])(
    'a sync REPORT answered %i keeps the message and its status (refused login: %s)',
    async (status, auth) => {
      const fetch = vi.fn().mockResolvedValue(response(status, 'Nope', '"no"'));

      const error = await smartCollectionSyncDetailed({
        account: {
          serverUrl: 'https://example.com/',
          rootUrl: 'https://example.com/',
          homeUrl: 'https://example.com/cal/',
          accountType: 'caldav',
        },
        collection: {
          url: 'https://example.com/cal/work/',
          syncToken: 'old',
          reports: ['syncCollection'],
          objects: [],
          objectMultiGet: vi.fn().mockResolvedValue([]),
        },
        fetch,
      }).catch((e) => e);

      expect(error.message).toBe(`Collection sync failed: ${status} Nope`);
      expect(tsdav.isDAVResponseError(error)).toBe(true);
      expect(tsdav.isDAVAuthenticationError(error)).toBe(auth);
      expect(error.status).toBe(status);
    },
  );

  it('fetchCalendarUserAddresses: a 403 keeps its status and the old message', async () => {
    const error = await fetchCalendarUserAddresses({
      account: {
        serverUrl: 'https://example.com/',
        rootUrl: 'https://example.com/',
        principalUrl: 'https://example.com/principals/u/',
        accountType: 'caldav',
      },
      fetch: vi.fn().mockResolvedValue(response(403, 'Forbidden', '"no"')),
    }).catch((e) => e);

    expect(error.message).toBe('cannot find calendarUserAddresses');
    expect(tsdav.isDAVResponseError(error)).toBe(true);
    expect(error.status).toBe(403);
    expect(error.url).toBe('https://example.com/principals/u/');
  });
});
