```ts
export type DAVCredentials = {
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  authorizationCode?: string;
  redirectUrl?: string;
  tokenUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiration?: number;
  digestString?: string;
  customData?: Record<string, unknown>;
};
```

refer to [this page](https://developers.google.com/identity/protocols/oauth2) for more on what these fields mean

- `username` basic auth username
- `password` basic auth password
- `clientId` oauth client id
- `clientSecret` oauth client secret
- `authorizationCode` oauth callback auth code
- `redirectUrl` oauth callback redirect url
- `tokenUrl` oauth api token url
- `accessToken` oauth access token
- `refreshToken` oauth refresh token
- `expiration` oauth access token expiration time
- `digestString` **deprecated**, a precomputed digest string sent as-is; only used with `authMethod: 'Digest'` when no `password` is set. Use `username` and `password` instead
- `customData` custom data used for custom auth, can be anything
