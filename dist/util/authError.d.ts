/**
 * Thrown when a DAV request, or an OAuth token request, is answered with an
 * error status. `status` and `url` say who answered what, so callers can tell
 * a missing collection from a refused one or a server failure without reading
 * the message.
 */
export declare class DAVResponseError extends Error {
    readonly code: string;
    readonly status: number;
    readonly url: string;
    constructor(message: string, params: {
        status: number;
        url: string;
    });
}
/**
 * Thrown when a server refuses the credentials: a DAV request answered with
 * 401, or an OAuth token endpoint refusing the grant (400 or 401, RFC 6749
 * 5.2). A DAVResponseError like any other error status, with its own code.
 */
export declare class DAVAuthenticationError extends DAVResponseError {
    readonly code: string;
    constructor(message: string, params: {
        status: number;
        url: string;
    });
}
export declare const isDAVAuthenticationError: (err: unknown) => err is DAVAuthenticationError;
export declare const isDAVResponseError: (err: unknown) => err is DAVResponseError;
/** The error for a DAV response with an error status: 401 is a refused login. */
export declare const davResponseError: (message: string, params: {
    status: number;
    url: string;
}) => DAVResponseError;
