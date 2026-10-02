import { DAVCredentials } from '../types/models';
import { fetch } from './fetch';
/**
 * HTTP Digest authentication (RFC 7616) as a `fetch` wrapper.
 *
 * A Digest `Authorization` header depends on the request method, the request
 * URI and a per-nonce counter, so it cannot be computed once at login like a
 * Basic header. Wrapping `fetch` puts the handshake under every request tsdav
 * makes (DAV requests, object PUT/DELETE and service discovery) without
 * touching each call site.
 */
type AuthChallenge = {
    scheme: string;
    params: Record<string, string>;
};
type DigestAlgorithm = 'MD5' | 'MD5-SESS' | 'SHA-256' | 'SHA-256-SESS';
export type DigestChallenge = {
    realm: string;
    nonce: string;
    opaque?: string;
    /** `auth` when the server offers it, undefined for RFC 2069 servers without qop */
    qop?: 'auth';
    algorithm: DigestAlgorithm;
    stale: boolean;
    userhash: boolean;
};
/**
 * Shared Digest state of one client: whether Digest is in use and the last
 * challenge (with its nonce counter) per origin.
 */
export type DigestAuthState = {
    active: boolean;
    challenges: Map<string, {
        challenge: DigestChallenge;
        nc: number;
    }>;
};
/**
 * Parse a `WWW-Authenticate` header value into its challenges. `fetch` joins
 * repeated headers with ", ", so one value can hold several challenges.
 */
export declare const parseAuthenticateHeader: (value: string) => AuthChallenge[];
/**
 * Pick the strongest supported Digest challenge from a `WWW-Authenticate`
 * value. Returns undefined when there is none, or when `unlessBasic` is set
 * and the server also accepts Basic.
 */
export declare const selectDigestChallenge: (header: string | null | undefined, { unlessBasic }?: {
    unlessBasic?: boolean;
}) => DigestChallenge | undefined;
/**
 * Compute the `Authorization` header value for one request (RFC 7616 §3.4;
 * RFC 2069 form when the challenge carries no qop).
 */
export declare const buildDigestAuthorization: (params: {
    challenge: DigestChallenge;
    username: string;
    password: string;
    method: string;
    uri: string;
    nc: number;
    cnonce: string;
}) => Promise<string>;
export declare const createDigestAuthState: (active: boolean) => DigestAuthState;
/**
 * Wrap `fetch` with Digest authentication.
 *
 * - Once a challenge is known for an origin, requests carry a fresh
 *   `Authorization` header up front (incrementing `nc`).
 * - A 401 with a Digest challenge is answered by exactly one retry; this also
 *   covers an expired (`stale=true`) nonce. A 401 on that retry is returned to
 *   the caller as a credentials error.
 * - With an inactive `state` (Basic auth), the wrapper only switches to
 *   Digest when a 401 offers Digest and no Basic. It never falls back from
 *   Digest to Basic.
 * - Redirects are followed by the wrapper, because the `Authorization` header
 *   is bound to the request URI. Credentials are only sent to the origin of
 *   the original request. A caller's `redirect: 'manual'` or `'error'` is
 *   passed through to `fetch` unchanged.
 */
export declare const createDigestFetch: (params: {
    credentials: Pick<DAVCredentials, 'username' | 'password'>;
    fetch?: typeof fetch;
    state?: DigestAuthState;
}) => typeof fetch;
export {};
