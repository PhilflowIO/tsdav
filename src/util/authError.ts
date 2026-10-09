/**
 * Thrown when a server refuses the credentials: a DAV request answered with
 * 401, or an OAuth token endpoint refusing the grant (4xx). `status` and `url`
 * say who refused, so callers can tell a wrong password from a server that is
 * down or is not a DAV server without reading the message.
 */
export class DAVAuthenticationError extends Error {
  readonly code = 'TSDAV_AUTHENTICATION_FAILED';

  readonly status: number;

  readonly url: string;

  constructor(message: string, params: { status: number; url: string }) {
    super(message);
    this.name = 'DAVAuthenticationError';
    this.status = params.status;
    this.url = params.url;
  }
}

export const isDAVAuthenticationError = (err: unknown): err is DAVAuthenticationError =>
  err instanceof DAVAuthenticationError ||
  (err as { code?: unknown } | null)?.code === 'TSDAV_AUTHENTICATION_FAILED';
