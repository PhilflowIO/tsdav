/**
 * Thrown when a DAV request, or an OAuth token request, is answered with an
 * error status. `status` and `url` say who answered what, so callers can tell
 * a missing collection from a refused one or a server failure without reading
 * the message.
 */
export class DAVResponseError extends Error {
  readonly code: string = 'TSDAV_RESPONSE_ERROR';

  readonly status: number;

  readonly url: string;

  constructor(message: string, params: { status: number; url: string }) {
    super(message);
    this.name = 'DAVResponseError';
    this.status = params.status;
    this.url = params.url;
  }
}

/**
 * Thrown when a server refuses the credentials: a DAV request answered with
 * 401, or an OAuth token endpoint refusing the grant (400 or 401, RFC 6749
 * 5.2). A DAVResponseError like any other error status, with its own code.
 */
export class DAVAuthenticationError extends DAVResponseError {
  override readonly code: string = 'TSDAV_AUTHENTICATION_FAILED';

  constructor(message: string, params: { status: number; url: string }) {
    super(message, params);
    this.name = 'DAVAuthenticationError';
  }
}

const codeOf = (err: unknown): unknown => (err as { code?: unknown } | null)?.code;

// The code is checked as well as the class: a bundler may load two copies of
// tsdav, and an error from one copy is no instance of the other's class.
export const isDAVAuthenticationError = (err: unknown): err is DAVAuthenticationError =>
  err instanceof DAVAuthenticationError || codeOf(err) === 'TSDAV_AUTHENTICATION_FAILED';

export const isDAVResponseError = (err: unknown): err is DAVResponseError =>
  err instanceof DAVResponseError ||
  codeOf(err) === 'TSDAV_RESPONSE_ERROR' ||
  isDAVAuthenticationError(err);

/** The error for a DAV response with an error status: 401 is a refused login. */
export const davResponseError = (
  message: string,
  params: { status: number; url: string },
): DAVResponseError =>
  params.status === 401
    ? new DAVAuthenticationError(message, params)
    : new DAVResponseError(message, params);
