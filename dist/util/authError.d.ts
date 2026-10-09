/**
 * Thrown when a server refuses the credentials: a DAV request answered with
 * 401, or an OAuth token endpoint refusing the grant (4xx). `status` and `url`
 * say who refused, so callers can tell a wrong password from a server that is
 * down or is not a DAV server without reading the message.
 */
export declare class DAVAuthenticationError extends Error {
    readonly code = "TSDAV_AUTHENTICATION_FAILED";
    readonly status: number;
    readonly url: string;
    constructor(message: string, params: {
        status: number;
        url: string;
    });
}
export declare const isDAVAuthenticationError: (err: unknown) => err is DAVAuthenticationError;
