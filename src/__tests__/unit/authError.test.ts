import { vi, describe, it, expect } from 'vitest';
import { createAccount, fetchPrincipalUrl } from '../../account';
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

  it('a token endpoint failing with 5xx stays a plain error', async () => {
    const fetch = vi.fn().mockResolvedValue(response(503, 'Service Unavailable'));

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

    expect(error).toBeInstanceOf(Error);
    expect(tsdav.isDAVAuthenticationError(error)).toBe(false);
    expect(error.message).toBe(
      'OAuth authentication failed: token endpoint returned no access token',
    );
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
