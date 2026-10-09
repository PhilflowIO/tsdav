# AuthHelpers

### getBasicAuthHeaders

convert the `username:password` into base64 auth header string:

```ts
const result = getBasicAuthHeaders({
  username: 'test',
  password: '12345',
});
```

#### Return Value

```ts
{
  authorization: 'Basic dGVzdDoxMjM0NQ==';
}
```

### fetchOauthTokens

fetch oauth token using code obtained from oauth2 authorization code grant

```ts
const tokens = await fetchOauthTokens({
  authorizationCode: '123',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  tokenUrl: 'https://oauth.example.com/tokens',
  redirectUrl: 'https://yourdomain.com/oauth-callback',
});
```

#### Return Value

```ts
{
  access_token: 'kTKGQ2TBEqn03KJMM9AqIA';
  refresh_token: 'iHwWwqytfW3AfOjNbM1HLg';
  expires_in: 12800;
  id_token: 'TKfsafGQ2JMM9AqIA';
  token_type: 'bearer';
  scope: 'openid email';
}
```

### refreshAccessToken

using refresh token to fetch access token from given token endpoint

```ts
const result = await refreshAccessToken({
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  tokenUrl: 'https://oauth.example.com/tokens',
  refreshToken: 'iHwWwqytfW3AfOjNbM1HLg',
});
```

#### Return Value

```ts
{
  access_token: 'eeMCxYgdCF3xfLxgd1NE8A';
  expires_in: 12800;
}
```

### getOauthHeaders

the combination of `fetchOauthTokens` and `refreshAccessToken`, it will return the authorization header needed for authorizing the requests as well as automatically renewing the access token using refresh token obtained from server when it expires.

```ts
const result = await getOauthHeaders({
  authorizationCode: '123',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  tokenUrl: 'https://oauth.example.com/tokens',
  redirectUrl: 'https://yourdomain.com/oauth-callback',
});
```

#### Return Value

```ts
{
  tokens: {
    access_token: 'kTKGQ2TBEqn03KJMM9AqIA';
    refresh_token: 'iHwWwqytfW3AfOjNbM1HLg';
    expires_in: 12800;
    id_token: 'TKfsafGQ2JMM9AqIA';
    token_type: 'bearer';
    scope: 'openid email';
  },
  headers: {
    authorization: `Bearer q-2OCH2g3RctZOJOG9T2Q`,
  },
}
```

Both client APIs check OAuth expiry before each request and share one refresh for concurrent requests.
The credentials object is updated with the access token, a rotated refresh token when supplied, and
an expiration in milliseconds when `expires_in` is supplied. Persist those updated fields with your
credential storage. A refresh failure rejects the client request before sending DAV traffic. A valid
access token can be reused without a refresh token; an unknown expiry with an available refresh token
triggers refresh when authentication is first resolved.

When the token endpoint answers with an error status, the result also carries
`failure: { status, url }`, and `tokens` and `headers` are empty.

### DAVResponseError and DAVAuthenticationError

tsdav throws a `DAVResponseError` when a request is answered with an error status: discovery
(`Calendar discovery failed: 403 Forbidden`, `cannot find principalUrl`, `cannot find homeUrl`),
a collection query (`Collection query failed: 500 …`), a collection status check, or an OAuth
token endpoint answering anything but a token. It is a subclass of `Error` with `code`
`'TSDAV_RESPONSE_ERROR'`, the HTTP `status` and the `url` that answered. The messages are the ones
tsdav threw before.

A refusal of the credentials is a `DAVAuthenticationError`, a subclass of `DAVResponseError` with
`code` `'TSDAV_AUTHENTICATION_FAILED'`: any of the above answered with `401` (account discovery:
`Invalid credentials: PROPFIND <url> returned 401 Unauthorized`), or an OAuth token endpoint
refusing the grant with `400` or `401` (RFC 6749 5.2; message `OAuth authentication failed: token
endpoint returned no access token`). A token endpoint answering `429`, `404` or `5xx` is a plain
`DAVResponseError` with that status. So a caller can tell a wrong password from a forbidden
resource, a rate limit or an unreachable server without reading the message.

`isDAVResponseError` and `isDAVAuthenticationError` also accept the `code`, so they work when two
copies of tsdav are loaded.

```ts
import { createDAVClient, isDAVAuthenticationError } from 'tsdav';

try {
  await createDAVClient({ serverUrl, credentials, authMethod: 'Basic', defaultAccountType: 'caldav' });
} catch (err) {
  if (isDAVAuthenticationError(err)) {
    console.error(`login refused by ${err.url} (${err.status})`);
  }
  throw err;
}
```

### defaultParam

:::caution
Internal function, not intended to be used outside.
:::

Provide default parameter for passed in function and allows default parameters be overridden when the function was actually passed with same parameters.
would only work on functions that have only one object style parameter.

```ts
const fn1 = (params: { a?: number; b?: number }) => {
  const { a = 0, b = 0 } = params;
  return a + b;
};
const fn2 = defaultParam(fn1, { b: 10 });
```

### digest auth and custom auth

for digest auth (RFC 7616), pass `username` and `password` with `authMethod: 'Digest'`.
tsdav answers the server's `WWW-Authenticate` challenge itself and computes a fresh
`Authorization` header for every request (MD5, MD5-sess, SHA-256 and SHA-256-sess with
`qop=auth`, or the RFC 2069 form when the server sends no `qop`).
Digest needs the WebCrypto API (`globalThis.crypto`): Node.js >= 19, browsers, Bun or Deno.
On Node.js 18 a Digest request fails with an error that says so.
While Digest is in use, tsdav follows redirects itself, since every hop needs its own
`Authorization` header. The returned `Response` then reports `redirected: false`; compare
`response.url` with the request URL if you need to know.

```ts
const client = await createDAVClient({
  serverUrl: 'https://baikal.example.com/dav.php',
  credentials: { username: 'user', password: 'password' },
  authMethod: 'Digest',
  defaultAccountType: 'caldav',
});
```

with `authMethod: 'Basic'`, a client switches to Digest on its own when the server answers
`401` with a Digest challenge and no Basic challenge, so servers such as Baïkal that only
accept Digest work either way. A client never falls back from Digest to Basic.

when calling the request functions directly, wrap `fetch` once and pass it to every call so
the challenge is reused:

```ts
const digestFetch = createDigestFetch({ credentials: { username: 'user', password: 'password' } });
const account = await createAccount({
  account: { serverUrl: 'https://baikal.example.com/dav.php', accountType: 'caldav' },
  fetch: digestFetch,
});
```

the `digestString` credential (a precomputed header value) is deprecated. It is still sent
as-is when no `password` is given.

for custom auth, you can pass additional data via `customData` prop to DAVCredentials,
you can pass in your custom auth function as `authFunction` param and will have DAVCredentials available to it.

### getBearerAuthHeaders

Generate Bearer authorization headers from an access token (useful for OIDC providers such as Nextcloud when supported).

```ts
const result = getBearerAuthHeaders({
  accessToken: 'YOUR_OIDC_ACCESS_TOKEN',
});
```

#### Return Value

```ts
{
  authorization: 'Bearer YOUR_OIDC_ACCESS_TOKEN',
}
```
