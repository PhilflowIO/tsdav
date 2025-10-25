import { ElementCompact } from 'xml-js';
import * as xml_js_types from 'xml-js/types';

type DAVDepth = '0' | '1' | 'infinity';
type DAVMethods = 'COPY' | 'LOCK' | 'MKCOL' | 'MOVE' | 'PROPFIND' | 'PROPPATCH' | 'UNLOCK' | 'REPORT' | 'SEARCH' | 'MKCALENDAR';
type HTTPMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
type DAVResponse = {
    raw?: any;
    href?: string;
    status: number;
    statusText: string;
    ok: boolean;
    error?: {
        [key: string]: any;
    };
    responsedescription?: string;
    props?: {
        [key: string]: {
            status: number;
            statusText: string;
            ok: boolean;
            value: any;
        } | any;
    };
};
type DAVRequest = {
    headers?: Record<string, string>;
    method: DAVMethods | HTTPMethods;
    body: any;
    namespace?: string;
    attributes?: Record<string, string>;
};
type DAVTokens = {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
    token_type?: string;
    scope?: string;
};

type DAVCollection = {
    objects?: DAVObject[];
    ctag?: string;
    description?: string;
    displayName?: string | Record<string, unknown>;
    reports?: any;
    resourcetype?: any;
    syncToken?: string;
    url: string;
    fetchOptions?: RequestInit;
    fetchObjects?: ((params?: {
        collection: DAVCalendar;
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
    }) => Promise<DAVCalendarObject[]>) | ((params?: {
        collection: DAVAddressBook;
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
    }) => Promise<DAVVCard[]>);
    objectMultiGet?: (params: {
        url: string;
        props: ElementCompact;
        objectUrls: string[];
        filters?: ElementCompact;
        timezone?: string;
        depth: DAVDepth;
        fetchOptions?: RequestInit;
        headers?: Record<string, string>;
    }) => Promise<DAVResponse[]>;
};
type DAVObject = {
    data?: any;
    etag?: string;
    url: string;
};
type DAVCredentials = {
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
type DAVAccount = {
    accountType: 'caldav' | 'carddav';
    serverUrl: string;
    credentials?: DAVCredentials;
    rootUrl?: string;
    principalUrl?: string;
    homeUrl?: string;
    calendars?: DAVCalendar[];
    addressBooks?: DAVAddressBook[];
};
type DAVVCard = DAVObject;
type DAVCalendarObject = DAVObject;
type DAVAddressBook = DAVCollection;
type DAVCalendar = {
    components?: string[];
    timezone?: string;
    projectedProps?: Record<string, unknown>;
    calendarColor?: string;
} & DAVCollection;

interface SmartCollectionSync {
    <T extends DAVCollection>(param: {
        collection: T;
        method?: 'basic' | 'webdav';
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
        account?: DAVAccount;
        detailedResult: true;
    }): Promise<Omit<T, 'objects'> & {
        objects: {
            created: DAVObject[];
            updated: DAVObject[];
            deleted: DAVObject[];
        };
    }>;
    <T extends DAVCollection>(param: {
        collection: T;
        method?: 'basic' | 'webdav';
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
        account?: DAVAccount;
        detailedResult?: false;
    }): Promise<T>;
}
interface SyncCalendars {
    (params: {
        oldCalendars: DAVCalendar[];
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
        account?: DAVAccount;
        detailedResult: true;
    }): Promise<{
        created: DAVCalendar[];
        updated: DAVCalendar[];
        deleted: DAVCalendar[];
    }>;
    (params: {
        oldCalendars: DAVCalendar[];
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
        account?: DAVAccount;
        detailedResult?: false;
    }): Promise<DAVCalendar[]>;
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type NoUndefinedField<T> = {
    [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>;
};

declare enum DAVNamespace {
    CALENDAR_SERVER = "http://calendarserver.org/ns/",
    CALDAV_APPLE = "http://apple.com/ns/ical/",
    CALDAV = "urn:ietf:params:xml:ns:caldav",
    CARDDAV = "urn:ietf:params:xml:ns:carddav",
    DAV = "DAV:"
}
declare const DAVAttributeMap: {
    "urn:ietf:params:xml:ns:caldav": string;
    "urn:ietf:params:xml:ns:carddav": string;
    "http://calendarserver.org/ns/": string;
    "http://apple.com/ns/ical/": string;
    "DAV:": string;
};
declare enum DAVNamespaceShort {
    CALDAV = "c",
    CARDDAV = "card",
    CALENDAR_SERVER = "cs",
    CALDAV_APPLE = "ca",
    DAV = "d"
}

declare const addressBookQuery: (params: {
    url: string;
    props: ElementCompact;
    filters?: ElementCompact;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const addressBookMultiGet: (params: {
    url: string;
    props: ElementCompact;
    objectUrls: string[];
    depth: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const fetchAddressBooks: (params?: {
    account?: DAVAccount;
    props?: ElementCompact;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVAddressBook[]>;
declare const fetchVCards: (params: {
    addressBook: DAVAddressBook;
    headers?: Record<string, string>;
    objectUrls?: string[];
    urlFilter?: (url: string) => boolean;
    useMultiGet?: boolean;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVVCard[]>;
declare const createVCard: (params: {
    addressBook: DAVAddressBook;
    vCardString: string;
    filename: string;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
declare const updateVCard: (params: {
    vCard: DAVVCard;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
declare const deleteVCard: (params: {
    vCard: DAVVCard;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;

declare const fetchCalendarUserAddresses: (params: {
    account: DAVAccount;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<string[]>;
declare const calendarQuery: (params: {
    url: string;
    props: ElementCompact;
    filters?: ElementCompact;
    timezone?: string;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const calendarMultiGet: (params: {
    url: string;
    props: ElementCompact;
    objectUrls?: string[];
    timezone?: string;
    depth: DAVDepth;
    filters?: ElementCompact;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const makeCalendar: (params: {
    url: string;
    props: ElementCompact;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const fetchCalendars: (params?: {
    account?: DAVAccount;
    props?: ElementCompact;
    projectedProps?: Record<string, boolean>;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVCalendar[]>;
declare const fetchCalendarObjects: (params: {
    calendar: DAVCalendar;
    objectUrls?: string[];
    filters?: ElementCompact;
    timeRange?: {
        start: string;
        end: string;
    };
    expand?: boolean;
    urlFilter?: (url: string) => boolean;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    useMultiGet?: boolean;
    fetchOptions?: RequestInit;
}) => Promise<DAVCalendarObject[]>;
declare const createCalendarObject: (params: {
    calendar: DAVCalendar;
    iCalString: string;
    filename: string;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
declare const updateCalendarObject: (params: {
    calendarObject: DAVCalendarObject;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
declare const deleteCalendarObject: (params: {
    calendarObject: DAVCalendarObject;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
/**
 * Sync remote calendars to local
 */
declare const syncCalendars: SyncCalendars;
declare const freeBusyQuery: (params: {
    url: string;
    timeRange: {
        start: string;
        end: string;
    };
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse>;

declare const collectionQuery: (params: {
    url: string;
    body: any;
    depth?: DAVDepth;
    defaultNamespace?: DAVNamespaceShort;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const makeCollection: (params: {
    url: string;
    props?: ElementCompact;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const supportedReportSet: (params: {
    collection: DAVCollection;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<string[]>;
declare const isCollectionDirty: (params: {
    collection: DAVCollection;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<{
    isDirty: boolean;
    newCtag: string;
}>;
/**
 * This is for webdav sync-collection only
 */
declare const syncCollection: (params: {
    url: string;
    props: ElementCompact;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    syncLevel?: number;
    syncToken?: string;
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
/** remote collection to local */
declare const smartCollectionSync: SmartCollectionSync;

declare const davRequest: (params: {
    url: string;
    init: DAVRequest;
    convertIncoming?: boolean;
    parseOutgoing?: boolean;
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const propfind: (params: {
    url: string;
    props: ElementCompact;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
declare const createObject: (params: {
    url: string;
    data: BodyInit;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
declare const updateObject: (params: {
    url: string;
    data: BodyInit;
    etag?: string;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
declare const deleteObject: (params: {
    url: string;
    etag?: string;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;

/**
 * Query todos using CalDAV REPORT calendar-query
 *
 * @param params.url - Calendar URL to query
 * @param params.props - Properties to request
 * @param params.filters - Optional CalDAV filters
 * @param params.timezone - Optional timezone
 * @param params.depth - Depth header value
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Array of DAV responses
 */
declare const todoQuery: (params: {
    url: string;
    props: ElementCompact;
    filters?: ElementCompact;
    timezone?: string;
    depth?: DAVDepth;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
/**
 * Fetch multiple todos by URL using CalDAV calendar-multiget
 *
 * @param params.url - Calendar URL
 * @param params.props - Properties to request
 * @param params.objectUrls - Array of todo object URLs to fetch
 * @param params.timezone - Optional timezone
 * @param params.depth - Depth header value
 * @param params.filters - Optional CalDAV filters
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Array of DAV responses
 */
declare const todoMultiGet: (params: {
    url: string;
    props: ElementCompact;
    objectUrls?: string[];
    timezone?: string;
    depth: DAVDepth;
    filters?: ElementCompact;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<DAVResponse[]>;
/**
 * Fetch VTODO objects from a CalDAV calendar with optional filtering
 *
 * @param params.calendar - Calendar to fetch todos from
 * @param params.objectUrls - Optional array of specific todo URLs to fetch
 * @param params.filters - Optional custom CalDAV filters
 * @param params.timeRange - Optional time range filter in ISO8601 format
 * @param params.expand - Whether to expand recurring todos
 * @param params.urlFilter - Custom filter function for todo object URLs
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.useMultiGet - Whether to use multiget (default: true)
 * @param params.fetchOptions - Fetch options
 * @returns Array of todo objects with url, etag, and iCalendar data
 * @throws Error if calendar URL is missing or timeRange format is invalid
 */
declare const fetchTodos: (params: {
    calendar: DAVCalendar;
    objectUrls?: string[];
    filters?: ElementCompact;
    timeRange?: {
        start: string;
        end: string;
    };
    expand?: boolean;
    urlFilter?: (url: string) => boolean;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    useMultiGet?: boolean;
    fetchOptions?: RequestInit;
}) => Promise<DAVCalendarObject[]>;
/**
 * Create a new VTODO object in a CalDAV calendar
 *
 * @param params.calendar - Calendar to create the todo in
 * @param params.iCalString - iCalendar data string (must contain UID)
 * @param params.filename - Filename for the todo object
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 * @throws Error if iCalString does not contain a UID
 */
declare const createTodo: (params: {
    calendar: DAVCalendar;
    iCalString: string;
    filename: string;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
/**
 * Update an existing VTODO object in a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to update (must have etag)
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 * @throws Error if calendarObject does not have an etag
 */
declare const updateTodo: (params: {
    calendarObject: DAVCalendarObject;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;
/**
 * Delete a VTODO object from a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to delete
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 */
declare const deleteTodo: (params: {
    calendarObject: DAVCalendarObject;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    fetchOptions?: RequestInit;
}) => Promise<Response>;

declare const createDAVClient: (params: {
    serverUrl: string;
    credentials: DAVCredentials;
    authMethod?: "Basic" | "Oauth" | "Digest" | "Custom";
    authFunction?: (credentials: DAVCredentials) => Promise<Record<string, string>>;
    defaultAccountType?: DAVAccount["accountType"] | undefined;
}) => Promise<{
    davRequest: (params0: {
        url: string;
        init: DAVRequest;
        convertIncoming?: boolean;
        parseOutgoing?: boolean;
    }) => Promise<DAVResponse[]>;
    propfind: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    createAccount: (params0: {
        account: Optional<DAVAccount, "serverUrl">;
        headers?: Record<string, string>;
        loadCollections?: boolean;
        loadObjects?: boolean;
    }) => Promise<DAVAccount>;
    createObject: (params: {
        url: string;
        data: BodyInit;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateObject: (params: {
        url: string;
        data: BodyInit;
        etag?: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteObject: (params: {
        url: string;
        etag?: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    calendarQuery: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        filters?: xml_js_types.ElementCompact;
        timezone?: string;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    addressBookQuery: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        filters?: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    collectionQuery: (params: {
        url: string;
        body: any;
        depth?: DAVDepth;
        defaultNamespace?: DAVNamespaceShort;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    makeCollection: (params: {
        url: string;
        props?: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    calendarMultiGet: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        objectUrls?: string[];
        timezone?: string;
        depth: DAVDepth;
        filters?: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    makeCalendar: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    syncCollection: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        syncLevel?: number;
        syncToken?: string;
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    supportedReportSet: (params: {
        collection: DAVCollection;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string[]>;
    isCollectionDirty: (params: {
        collection: DAVCollection;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<{
        isDirty: boolean;
        newCtag: string;
    }>;
    smartCollectionSync: SmartCollectionSync;
    fetchCalendars: (params?: {
        account?: DAVAccount;
        props?: xml_js_types.ElementCompact;
        projectedProps?: Record<string, boolean>;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    } | undefined) => Promise<DAVCalendar[]>;
    fetchCalendarUserAddresses: (params: {
        account: DAVAccount;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string[]>;
    fetchCalendarObjects: (params: {
        calendar: DAVCalendar;
        objectUrls?: string[];
        filters?: xml_js_types.ElementCompact;
        timeRange?: {
            start: string;
            end: string;
        };
        expand?: boolean;
        urlFilter?: (url: string) => boolean;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        useMultiGet?: boolean;
        fetchOptions?: RequestInit;
    }) => Promise<DAVObject[]>;
    createCalendarObject: (params: {
        calendar: DAVCalendar;
        iCalString: string;
        filename: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateCalendarObject: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteCalendarObject: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    syncCalendars: SyncCalendars;
    fetchAddressBooks: (params?: {
        account?: DAVAccount;
        props?: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    } | undefined) => Promise<DAVCollection[]>;
    addressBookMultiGet: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        objectUrls: string[];
        depth: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    fetchVCards: (params: {
        addressBook: DAVAddressBook;
        headers?: Record<string, string>;
        objectUrls?: string[];
        urlFilter?: (url: string) => boolean;
        useMultiGet?: boolean;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVObject[]>;
    createVCard: (params: {
        addressBook: DAVAddressBook;
        vCardString: string;
        filename: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateVCard: (params: {
        vCard: DAVVCard;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteVCard: (params: {
        vCard: DAVVCard;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    todoQuery: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        filters?: xml_js_types.ElementCompact;
        timezone?: string;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    todoMultiGet: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        objectUrls?: string[];
        timezone?: string;
        depth: DAVDepth;
        filters?: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    fetchTodos: (params: {
        calendar: DAVCalendar;
        objectUrls?: string[];
        filters?: xml_js_types.ElementCompact;
        timeRange?: {
            start: string;
            end: string;
        };
        expand?: boolean;
        urlFilter?: (url: string) => boolean;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        useMultiGet?: boolean;
        fetchOptions?: RequestInit;
    }) => Promise<DAVObject[]>;
    createTodo: (params: {
        calendar: DAVCalendar;
        iCalString: string;
        filename: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateTodo: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteTodo: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
}>;
declare class DAVClient {
    serverUrl: string;
    credentials: DAVCredentials;
    authMethod: 'Basic' | 'Oauth' | 'Digest' | 'Custom';
    accountType: DAVAccount['accountType'];
    authHeaders?: Record<string, string>;
    account?: DAVAccount;
    fetchOptions?: RequestInit;
    authFunction?: (credentials: DAVCredentials) => Promise<Record<string, string>>;
    constructor(params: {
        serverUrl: string;
        credentials: DAVCredentials;
        authMethod?: 'Basic' | 'Oauth' | 'Digest' | 'Custom';
        authFunction?: (credentials: DAVCredentials) => Promise<Record<string, string>>;
        defaultAccountType?: DAVAccount['accountType'] | undefined;
        fetchOptions?: RequestInit;
    });
    login(): Promise<void>;
    davRequest(params0: {
        url: string;
        init: DAVRequest;
        convertIncoming?: boolean;
        parseOutgoing?: boolean;
        fetchOptions?: RequestInit;
    }): Promise<DAVResponse[]>;
    createObject(...params: Parameters<typeof createObject>): Promise<Response>;
    updateObject(...params: Parameters<typeof updateObject>): Promise<Response>;
    deleteObject(...params: Parameters<typeof deleteObject>): Promise<Response>;
    propfind(...params: Parameters<typeof propfind>): Promise<DAVResponse[]>;
    createAccount(params0: {
        account: Optional<DAVAccount, 'serverUrl'>;
        headers?: Record<string, string>;
        loadCollections?: boolean;
        loadObjects?: boolean;
        fetchOptions?: RequestInit;
    }): Promise<DAVAccount>;
    collectionQuery(...params: Parameters<typeof collectionQuery>): Promise<DAVResponse[]>;
    makeCollection(...params: Parameters<typeof makeCollection>): Promise<DAVResponse[]>;
    syncCollection(...params: Parameters<typeof syncCollection>): Promise<DAVResponse[]>;
    supportedReportSet(...params: Parameters<typeof supportedReportSet>): Promise<string[]>;
    isCollectionDirty(...params: Parameters<typeof isCollectionDirty>): Promise<{
        isDirty: boolean;
        newCtag: string;
    }>;
    smartCollectionSync<T extends DAVCollection>(param: {
        collection: T;
        method?: 'basic' | 'webdav';
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
        account?: DAVAccount;
        detailedResult?: false;
    }): Promise<T>;
    smartCollectionSync<T extends DAVCollection>(param: {
        collection: T;
        method?: 'basic' | 'webdav';
        headers?: Record<string, string>;
        fetchOptions?: RequestInit;
        account?: DAVAccount;
        detailedResult: true;
    }): Promise<Omit<T, 'objects'> & {
        objects: {
            created: DAVObject[];
            updated: DAVObject[];
            deleted: DAVObject[];
        };
    }>;
    calendarQuery(...params: Parameters<typeof calendarQuery>): Promise<DAVResponse[]>;
    makeCalendar(...params: Parameters<typeof makeCalendar>): Promise<DAVResponse[]>;
    calendarMultiGet(...params: Parameters<typeof calendarMultiGet>): Promise<DAVResponse[]>;
    fetchCalendars(...params: Parameters<typeof fetchCalendars>): Promise<DAVCalendar[]>;
    fetchCalendarUserAddresses(...params: Parameters<typeof fetchCalendarUserAddresses>): Promise<string[]>;
    fetchCalendarObjects(...params: Parameters<typeof fetchCalendarObjects>): Promise<DAVCalendarObject[]>;
    createCalendarObject(...params: Parameters<typeof createCalendarObject>): Promise<Response>;
    updateCalendarObject(...params: Parameters<typeof updateCalendarObject>): Promise<Response>;
    deleteCalendarObject(...params: Parameters<typeof deleteCalendarObject>): Promise<Response>;
    syncCalendars(...params: Parameters<SyncCalendars>): Promise<ReturnType<SyncCalendars>>;
    addressBookQuery(...params: Parameters<typeof addressBookQuery>): Promise<DAVResponse[]>;
    addressBookMultiGet(...params: Parameters<typeof addressBookMultiGet>): Promise<DAVResponse[]>;
    fetchAddressBooks(...params: Parameters<typeof fetchAddressBooks>): Promise<DAVAddressBook[]>;
    fetchVCards(...params: Parameters<typeof fetchVCards>): Promise<DAVVCard[]>;
    createVCard(...params: Parameters<typeof createVCard>): Promise<Response>;
    updateVCard(...params: Parameters<typeof updateVCard>): Promise<Response>;
    deleteVCard(...params: Parameters<typeof deleteVCard>): Promise<Response>;
    todoQuery(...params: Parameters<typeof todoQuery>): Promise<DAVResponse[]>;
    todoMultiGet(...params: Parameters<typeof todoMultiGet>): Promise<DAVResponse[]>;
    fetchTodos(...params: Parameters<typeof fetchTodos>): Promise<DAVCalendarObject[]>;
    createTodo(...params: Parameters<typeof createTodo>): Promise<Response>;
    updateTodo(...params: Parameters<typeof updateTodo>): Promise<Response>;
    deleteTodo(...params: Parameters<typeof deleteTodo>): Promise<Response>;
}

/**
 * Field-Based Update Types for tsdav
 *
 * These types support field-level updates for CalDAV, CardDAV, and VTODO objects
 * without requiring manual iCal/vCard string generation.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545 - iCalendar (VEVENT, VTODO)
 * @see https://datatracker.ietf.org/doc/html/rfc6350 - vCard
 */
/**
 * Base configuration for field updaters
 *
 * Controls automatic behavior when updating fields
 */
interface BaseFieldUpdaterConfig {
    /**
     * Auto-increment SEQUENCE property (RFC 5545 Section 3.8.7.4)
     *
     * SEQUENCE indicates the revision sequence number of the calendar component.
     * It MUST be incremented each time the event is modified.
     *
     * @default true
     */
    autoIncrementSequence?: boolean;
    /**
     * Auto-update DTSTAMP property (RFC 5545 Section 3.8.7.2)
     *
     * DTSTAMP indicates the date/time the instance of the iCalendar object was created.
     * It SHOULD be updated each time the event is modified.
     *
     * @default true
     */
    autoUpdateDtstamp?: boolean;
    /**
     * Preserve fields not explicitly updated
     *
     * When true, fields not mentioned in the update will be preserved from the original object.
     * When false, only specified fields will be present in the result.
     *
     * @default true
     */
    preserveUnknownFields?: boolean;
    /**
     * Preserve vendor-specific extensions (X-* properties)
     *
     * Many CalDAV servers add custom properties like X-APPLE-SORT-ORDER, X-GOOGLE-*.
     * When true, these will be preserved during updates.
     *
     * @default true
     */
    preserveVendorExtensions?: boolean;
}
/**
 * Result of a field update operation
 *
 * Contains the updated data string and metadata about the operation
 */
interface FieldUpdateResult {
    /**
     * Updated iCal/vCard string
     *
     * This string can be passed directly to updateCalendarObject/updateVCard/updateTodo
     */
    data: string;
    /**
     * Whether any fields were actually modified
     *
     * False if all provided field values matched existing values
     */
    modified: boolean;
    /**
     * Optional warnings encountered during update
     *
     * Examples:
     * - "SEQUENCE already at value X, not incremented"
     * - "VTIMEZONE component not found"
     * - "Unknown property X-CUSTOM preserved"
     */
    warnings?: string[];
    /**
     * Metadata about the update
     */
    metadata?: {
        /**
         * New SEQUENCE value (if auto-incremented)
         */
        sequence?: number;
        /**
         * New DTSTAMP value (if auto-updated)
         *
         * ISO 8601 format: YYYYMMDDTHHMMSSZ
         */
        dtstamp?: string;
        /**
         * Number of vendor extensions preserved
         */
        vendorExtensionsCount?: number;
    };
}
/**
 * vCard field update options (RFC 6350)
 *
 * Supported fields for CardDAV vCard updates
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6350
 */
interface VCardFields {
    /**
     * FN - Formatted Name (required in vCard 3.0/4.0)
     *
     * The formatted text corresponding to the name of the object.
     *
     * Example: "Dr. John Q. Public, Esq."
     */
    FN?: string;
    /**
     * N - Structured Name
     *
     * Format: Family;Given;Additional;Prefix;Suffix
     *
     * Example: "Public;John;Quinlan;Mr.;Esq."
     */
    N?: string;
    /**
     * EMAIL - Email Address
     *
     * Example: "john@example.com"
     */
    EMAIL?: string;
    /**
     * TEL - Telephone Number
     *
     * Example: "+1-555-555-5555"
     */
    TEL?: string;
    /**
     * ORG - Organization
     *
     * Example: "ABC Inc."
     */
    ORG?: string;
    /**
     * NOTE - Notes/Comments
     *
     * Example: "Met at conference 2024"
     */
    NOTE?: string;
    /**
     * TITLE - Job Title
     *
     * Example: "Software Engineer"
     */
    TITLE?: string;
    /**
     * URL - Web URL
     *
     * Example: "https://example.com"
     */
    URL?: string;
}
/**
 * Calendar Event (VEVENT) field update options (RFC 5545)
 *
 * Supported fields for CalDAV calendar event updates
 *
 * MVP: SUMMARY, DESCRIPTION
 * Future: DTSTART, DTEND, RRULE, LOCATION, etc.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.1
 */
interface EventFields {
    /**
     * SUMMARY - Brief description/title
     *
     * A short summary or subject for the calendar component.
     *
     * Example: "Team Meeting"
     */
    SUMMARY?: string;
    /**
     * DESCRIPTION - Detailed description
     *
     * A more complete description of the calendar component.
     *
     * Example: "Quarterly team meeting to discuss Q1 objectives"
     */
    DESCRIPTION?: string;
}
/**
 * Todo (VTODO) field update options (RFC 5545)
 *
 * Supported fields for CalDAV todo updates
 *
 * MVP: SUMMARY, DESCRIPTION
 * Future: DUE, STATUS, PRIORITY, PERCENT-COMPLETE
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.2
 */
interface TodoFields {
    /**
     * SUMMARY - Brief description/title
     *
     * Example: "Fix login bug"
     */
    SUMMARY?: string;
    /**
     * DESCRIPTION - Detailed description
     *
     * Example: "Users cannot login with special characters in password"
     */
    DESCRIPTION?: string;
}

declare const createAccount: (params: {
    account: DAVAccount;
    headers?: Record<string, string>;
    headersToExclude?: string[];
    loadCollections?: boolean;
    loadObjects?: boolean;
    fetchOptions?: RequestInit;
}) => Promise<DAVAccount>;

/**
 * Calendar Event (VEVENT) Field Updater
 *
 * This module provides field-based updates for CalDAV calendar events (VEVENT).
 * It allows updating individual fields like SUMMARY and DESCRIPTION without
 * requiring manual iCal string generation.
 *
 * Features:
 * - Update SUMMARY and DESCRIPTION fields
 * - Auto-increment SEQUENCE on modifications (RFC 5545)
 * - Auto-update DTSTAMP to current timestamp
 * - Preserve VCALENDAR wrapper and VTIMEZONE components
 * - Preserve vendor extensions (X-* properties)
 * - Protect UID from modification
 * - Proper RFC 5545 line folding for long values
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.1
 */

/**
 * Update fields in a calendar event (VEVENT)
 *
 * This function updates specified fields in a CalDAV calendar object while
 * preserving the VCALENDAR structure, VTIMEZONE components, and vendor extensions.
 *
 * @param calendarObject - DAVCalendarObject containing iCal data
 * @param fields - Fields to update (SUMMARY, DESCRIPTION)
 * @param config - Optional configuration for update behavior
 * @returns FieldUpdateResult with updated iCal string and metadata
 *
 * @throws Error if UID is missing or invalid iCal format
 *
 * @example
 * ```typescript
 * const updated = updateEventFields(calendarObject, {
 *   SUMMARY: 'Updated Meeting Title',
 *   DESCRIPTION: 'New detailed description'
 * });
 * console.log(updated.data); // Updated iCal string
 * console.log(updated.metadata.sequence); // Incremented sequence number
 * ```
 */
declare function updateEventFields(calendarObject: DAVCalendarObject, fields: EventFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult;
/**
 * Check if a calendar object contains a valid VEVENT
 *
 * Utility function to validate that a calendar object has a proper VEVENT component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns true if valid VEVENT exists
 */
declare function hasValidVEvent(calendarObject: DAVCalendarObject): boolean;
/**
 * Extract event fields from a calendar object
 *
 * Utility function to extract current field values from a VEVENT
 *
 * @param calendarObject - DAVCalendarObject to extract from
 * @returns EventFields with current values
 *
 * @example
 * ```typescript
 * const currentFields = extractEventFields(calendarObject);
 * console.log(currentFields.SUMMARY); // "Team Meeting"
 * console.log(currentFields.DESCRIPTION); // "Quarterly review"
 * ```
 */
declare function extractEventFields(calendarObject: DAVCalendarObject): EventFields;

/**
 * vCard Field Updater for tsdav
 *
 * Provides field-level updates for CardDAV vCards without requiring
 * manual vCard string generation.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6350 - vCard 4.0
 * @see https://datatracker.ietf.org/doc/html/rfc2426 - vCard 3.0
 *
 * ⚠️ READ-ONLY DEPENDENCIES:
 * - src/util/fieldUpdater.ts (shared utilities)
 * - src/types/fieldUpdates.ts (type definitions)
 */

/**
 * Update vCard fields
 *
 * Updates specified fields in a vCard while preserving other properties.
 * Automatically handles:
 * - Line folding for long values (>75 chars)
 * - UTF-8 character encoding
 * - REV (revision) timestamp updates
 * - Vendor extension preservation (X-* properties)
 *
 * @param vCard - DAVVCard object containing vCard data
 * @param fields - Fields to update (VCardFields)
 * @param config - Optional configuration
 * @returns FieldUpdateResult with updated vCard data and metadata
 *
 * @throws Error if vCard parsing fails
 * @throws Error if UID is missing or would be removed
 * @throws Error if FN would be removed (required field)
 *
 * @example
 * ```typescript
 * const updated = updateVCardFields(vCard, {
 *   FN: 'Dr. John Q. Public, Esq.',
 *   EMAIL: 'john@example.com',
 *   TEL: '+1-555-555-5555'
 * });
 *
 * console.log(updated.data); // Updated vCard string
 * console.log(updated.modified); // true
 * ```
 *
 * @example
 * ```typescript
 * // Update structured N field
 * const updated = updateVCardFields(vCard, {
 *   N: 'Public;John;Quinlan;Dr.;Esq.',
 *   FN: 'Dr. John Q. Public, Esq.'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Remove a field by setting it to empty string
 * const updated = updateVCardFields(vCard, {
 *   NOTE: '' // Removes NOTE property
 * });
 * ```
 */
declare function updateVCardFields(vCard: DAVVCard, fields: VCardFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult;
/**
 * Helper function to validate vCard fields before update
 *
 * Performs validation checks on field values before attempting update.
 * Useful for validating user input before making server requests.
 *
 * @param fields - Fields to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateVCardFields({
 *   FN: '', // Error: FN is required
 *   EMAIL: 'invalid-email', // Warning: not a valid email format
 * });
 *
 * if (errors.length > 0) {
 *   console.error('Validation errors:', errors);
 * }
 * ```
 */
declare function validateVCardFields(fields: VCardFields): string[];
/**
 * Helper function to extract vCard fields
 *
 * Extracts field values from a vCard for reading/display purposes.
 *
 * @param vCard - DAVVCard object
 * @returns VCardFields object with current field values
 *
 * @example
 * ```typescript
 * const fields = extractVCardFields(vCard);
 * console.log(fields.FN); // "John Doe"
 * console.log(fields.EMAIL); // "john@example.com"
 * ```
 */
declare function extractVCardFields(vCard: DAVVCard): Partial<VCardFields>;

/**
 * VTODO Field-Based Updates
 *
 * This module provides field-level updates for VTODO (todo/task) objects
 * without requiring manual iCal string generation.
 *
 * Similar to eventFieldUpdater.ts but tailored for VTODO components.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.2 - VTODO Component
 */

/**
 * Update fields in a VTODO calendar object
 *
 * This function allows updating specific fields in a VTODO without manually
 * constructing iCal strings. It handles:
 * - Field updates (SUMMARY, DESCRIPTION)
 * - SEQUENCE auto-increment (RFC 5545 Section 3.8.7.4)
 * - DTSTAMP auto-update (RFC 5545 Section 3.8.7.2)
 * - VCALENDAR wrapper preservation
 * - Vendor extension preservation (X-* properties)
 * - Proper line folding (RFC 5545 Section 3.1)
 *
 * @param calendarObject - DAVCalendarObject containing VTODO data
 * @param fields - Fields to update
 * @param config - Optional configuration for auto-update behavior
 * @returns FieldUpdateResult with updated iCal string and metadata
 * @throws Error if parsing fails, UID is missing, or VTODO component not found
 *
 * @example
 * ```ts
 * const updated = updateTodoFields(
 *   calendarObject,
 *   {
 *     SUMMARY: 'Updated Todo Title',
 *     DESCRIPTION: 'Updated detailed description'
 *   },
 *   {
 *     autoIncrementSequence: true,
 *     autoUpdateDtstamp: true
 *   }
 * );
 *
 * console.log(updated.data); // Updated iCal string
 * console.log(updated.modified); // true if any fields changed
 * console.log(updated.metadata.sequence); // New SEQUENCE value
 * ```
 */
declare function updateTodoFields(calendarObject: DAVCalendarObject, fields: TodoFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult;
/**
 * Batch update multiple VTODO objects with the same fields
 *
 * This is useful for updating multiple todos with the same changes,
 * such as moving todos to a different category or updating status.
 *
 * @param calendarObjects - Array of DAVCalendarObject containing VTODO data
 * @param fields - Fields to update (same for all objects)
 * @param config - Optional configuration for auto-update behavior
 * @returns Array of FieldUpdateResult for each object
 *
 * @example
 * ```ts
 * const results = batchUpdateTodoFields(
 *   [todo1, todo2, todo3],
 *   { SUMMARY: 'Updated Title' }
 * );
 *
 * results.forEach((result, index) => {
 *   console.log(`Todo ${index}: ${result.modified ? 'modified' : 'unchanged'}`);
 * });
 * ```
 */
declare function batchUpdateTodoFields(calendarObjects: DAVCalendarObject[], fields: TodoFields, config?: BaseFieldUpdaterConfig): FieldUpdateResult[];
/**
 * Helper function to check if a calendar object contains a VTODO component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns True if object contains VTODO, false otherwise
 *
 * @example
 * ```ts
 * if (isTodoObject(calendarObject)) {
 *   const result = updateTodoFields(calendarObject, { SUMMARY: 'New title' });
 * }
 * ```
 */
declare function isTodoObject(calendarObject: DAVCalendarObject): boolean;
/**
 * Extract VTODO fields from a calendar object
 *
 * Useful for reading current values before updating.
 *
 * @param calendarObject - DAVCalendarObject containing VTODO data
 * @returns TodoFields with current values
 * @throws Error if parsing fails or VTODO component not found
 *
 * @example
 * ```ts
 * const currentFields = extractTodoFields(calendarObject);
 * console.log(currentFields.SUMMARY); // "Current Todo Title"
 *
 * // Update only if needed
 * if (currentFields.SUMMARY !== desiredSummary) {
 *   updateTodoFields(calendarObject, { SUMMARY: desiredSummary });
 * }
 * ```
 */
declare function extractTodoFields(calendarObject: DAVCalendarObject): TodoFields;

declare const getBasicAuthHeaders: (credentials: DAVCredentials) => {
    authorization?: string;
};
declare const fetchOauthTokens: (credentials: DAVCredentials, fetchOptions?: RequestInit) => Promise<DAVTokens>;
declare const refreshAccessToken: (credentials: DAVCredentials, fetchOptions?: RequestInit) => Promise<{
    access_token?: string;
    expires_in?: number;
}>;
declare const getOauthHeaders: (credentials: DAVCredentials, fetchOptions?: RequestInit) => Promise<{
    tokens: DAVTokens;
    headers: {
        authorization?: string;
    };
}>;

declare const urlEquals: (urlA?: string, urlB?: string) => boolean;
declare const urlContains: (urlA?: string, urlB?: string) => boolean;
declare const getDAVAttribute: (nsArr: DAVNamespace[]) => {
    [key: string]: DAVNamespace;
};
declare const cleanupFalsy: <T extends object = object>(obj: T) => NoUndefinedField<T>;

declare const _default: {
    urlEquals: (urlA?: string, urlB?: string) => boolean;
    urlContains: (urlA?: string, urlB?: string) => boolean;
    getDAVAttribute: (nsArr: DAVNamespace[]) => {
        [key: string]: DAVNamespace;
    };
    cleanupFalsy: <T extends object = object>(obj: T) => NoUndefinedField<T>;
    conditionalParam: <T>(key: string, param: T) => {
        [key: string]: T;
    };
    excludeHeaders: (headers: Record<string, string> | undefined, headersToExclude: string[] | undefined) => Record<string, string>;
    defaultIcsFilter: (url: string) => boolean;
    validateISO8601TimeRange: (start: string, end: string) => void;
    defaultParam: <F extends (...args: any[]) => any>(fn: F, params: Partial<Parameters<F>[0]>) => (...args: Parameters<F>) => ReturnType<F>;
    getBasicAuthHeaders: (credentials: DAVCredentials) => {
        authorization?: string;
    };
    fetchOauthTokens: (credentials: DAVCredentials, fetchOptions?: RequestInit) => Promise<DAVTokens>;
    refreshAccessToken: (credentials: DAVCredentials, fetchOptions?: RequestInit) => Promise<{
        access_token?: string;
        expires_in?: number;
    }>;
    getOauthHeaders: (credentials: DAVCredentials, fetchOptions?: RequestInit) => Promise<{
        tokens: DAVTokens;
        headers: {
            authorization?: string;
        };
    }>;
    todoQuery: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        filters?: xml_js_types.ElementCompact;
        timezone?: string;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    todoMultiGet: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        objectUrls?: string[];
        timezone?: string;
        depth: DAVDepth;
        filters?: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    fetchTodos: (params: {
        calendar: DAVCalendar;
        objectUrls?: string[];
        filters?: xml_js_types.ElementCompact;
        timeRange?: {
            start: string;
            end: string;
        };
        expand?: boolean;
        urlFilter?: (url: string) => boolean;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        useMultiGet?: boolean;
        fetchOptions?: RequestInit;
    }) => Promise<DAVCalendarObject[]>;
    createTodo: (params: {
        calendar: DAVCalendar;
        iCalString: string;
        filename: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateTodo: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteTodo: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    fetchCalendarUserAddresses: (params: {
        account: DAVAccount;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string[]>;
    calendarQuery: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        filters?: xml_js_types.ElementCompact;
        timezone?: string;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    calendarMultiGet: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        objectUrls?: string[];
        timezone?: string;
        depth: DAVDepth;
        filters?: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    makeCalendar: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    fetchCalendars: (params?: {
        account?: DAVAccount;
        props?: xml_js_types.ElementCompact;
        projectedProps?: Record<string, boolean>;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVCalendar[]>;
    fetchCalendarObjects: (params: {
        calendar: DAVCalendar;
        objectUrls?: string[];
        filters?: xml_js_types.ElementCompact;
        timeRange?: {
            start: string;
            end: string;
        };
        expand?: boolean;
        urlFilter?: (url: string) => boolean;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        useMultiGet?: boolean;
        fetchOptions?: RequestInit;
    }) => Promise<DAVCalendarObject[]>;
    createCalendarObject: (params: {
        calendar: DAVCalendar;
        iCalString: string;
        filename: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateCalendarObject: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteCalendarObject: (params: {
        calendarObject: DAVCalendarObject;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    syncCalendars: SyncCalendars;
    freeBusyQuery: (params: {
        url: string;
        timeRange: {
            start: string;
            end: string;
        };
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse>;
    addressBookQuery: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        filters?: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    addressBookMultiGet: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        objectUrls: string[];
        depth: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    fetchAddressBooks: (params?: {
        account?: DAVAccount;
        props?: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVAddressBook[]>;
    fetchVCards: (params: {
        addressBook: DAVAddressBook;
        headers?: Record<string, string>;
        objectUrls?: string[];
        urlFilter?: (url: string) => boolean;
        useMultiGet?: boolean;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVVCard[]>;
    createVCard: (params: {
        addressBook: DAVAddressBook;
        vCardString: string;
        filename: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateVCard: (params: {
        vCard: DAVVCard;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteVCard: (params: {
        vCard: DAVVCard;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    serviceDiscovery: (params: {
        account: DAVAccount;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string>;
    fetchPrincipalUrl: (params: {
        account: DAVAccount;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string>;
    fetchHomeUrl: (params: {
        account: DAVAccount;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string>;
    createAccount: (params: {
        account: DAVAccount;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        loadCollections?: boolean;
        loadObjects?: boolean;
        fetchOptions?: RequestInit;
    }) => Promise<DAVAccount>;
    collectionQuery: (params: {
        url: string;
        body: any;
        depth?: DAVDepth;
        defaultNamespace?: DAVNamespaceShort;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    makeCollection: (params: {
        url: string;
        props?: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    supportedReportSet: (params: {
        collection: DAVCollection;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<string[]>;
    isCollectionDirty: (params: {
        collection: DAVCollection;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<{
        isDirty: boolean;
        newCtag: string;
    }>;
    syncCollection: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        syncLevel?: number;
        syncToken?: string;
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    smartCollectionSync: SmartCollectionSync;
    davRequest: (params: {
        url: string;
        init: DAVRequest;
        convertIncoming?: boolean;
        parseOutgoing?: boolean;
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    propfind: (params: {
        url: string;
        props: xml_js_types.ElementCompact;
        depth?: DAVDepth;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<DAVResponse[]>;
    createObject: (params: {
        url: string;
        data: BodyInit;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    updateObject: (params: {
        url: string;
        data: BodyInit;
        etag?: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    deleteObject: (params: {
        url: string;
        etag?: string;
        headers?: Record<string, string>;
        headersToExclude?: string[];
        fetchOptions?: RequestInit;
    }) => Promise<Response>;
    createDAVClient: (params: {
        serverUrl: string;
        credentials: DAVCredentials;
        authMethod?: "Basic" | "Oauth" | "Digest" | "Custom";
        authFunction?: (credentials: DAVCredentials) => Promise<Record<string, string>>;
        defaultAccountType?: DAVAccount["accountType"] | undefined;
    }) => Promise<{
        davRequest: (params0: {
            url: string;
            init: DAVRequest;
            convertIncoming?: boolean;
            parseOutgoing?: boolean;
        }) => Promise<DAVResponse[]>;
        propfind: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            depth?: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        createAccount: (params0: {
            account: Optional<DAVAccount, "serverUrl">;
            headers?: Record<string, string>;
            loadCollections?: boolean;
            loadObjects?: boolean;
        }) => Promise<DAVAccount>;
        createObject: (params: {
            url: string;
            data: BodyInit;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        updateObject: (params: {
            url: string;
            data: BodyInit;
            etag?: string;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        deleteObject: (params: {
            url: string;
            etag?: string;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        calendarQuery: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            filters?: xml_js_types.ElementCompact;
            timezone?: string;
            depth?: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        addressBookQuery: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            filters?: xml_js_types.ElementCompact;
            depth?: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        collectionQuery: (params: {
            url: string;
            body: any;
            depth?: DAVDepth;
            defaultNamespace?: DAVNamespaceShort;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        makeCollection: (params: {
            url: string;
            props?: xml_js_types.ElementCompact;
            depth?: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        calendarMultiGet: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            objectUrls?: string[];
            timezone?: string;
            depth: DAVDepth;
            filters?: xml_js_types.ElementCompact;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        makeCalendar: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            depth?: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        syncCollection: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            syncLevel?: number;
            syncToken?: string;
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        supportedReportSet: (params: {
            collection: DAVCollection;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<string[]>;
        isCollectionDirty: (params: {
            collection: DAVCollection;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<{
            isDirty: boolean;
            newCtag: string;
        }>;
        smartCollectionSync: SmartCollectionSync;
        fetchCalendars: (params?: {
            account?: DAVAccount;
            props?: xml_js_types.ElementCompact;
            projectedProps?: Record<string, boolean>;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        } | undefined) => Promise<DAVCalendar[]>;
        fetchCalendarUserAddresses: (params: {
            account: DAVAccount;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<string[]>;
        fetchCalendarObjects: (params: {
            calendar: DAVCalendar;
            objectUrls?: string[];
            filters?: xml_js_types.ElementCompact;
            timeRange?: {
                start: string;
                end: string;
            };
            expand?: boolean;
            urlFilter?: (url: string) => boolean;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            useMultiGet?: boolean;
            fetchOptions?: RequestInit;
        }) => Promise<DAVObject[]>;
        createCalendarObject: (params: {
            calendar: DAVCalendar;
            iCalString: string;
            filename: string;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        updateCalendarObject: (params: {
            calendarObject: DAVCalendarObject;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        deleteCalendarObject: (params: {
            calendarObject: DAVCalendarObject;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        syncCalendars: SyncCalendars;
        fetchAddressBooks: (params?: {
            account?: DAVAccount;
            props?: xml_js_types.ElementCompact;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        } | undefined) => Promise<DAVCollection[]>;
        addressBookMultiGet: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            objectUrls: string[];
            depth: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        fetchVCards: (params: {
            addressBook: DAVAddressBook;
            headers?: Record<string, string>;
            objectUrls?: string[];
            urlFilter?: (url: string) => boolean;
            useMultiGet?: boolean;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVObject[]>;
        createVCard: (params: {
            addressBook: DAVAddressBook;
            vCardString: string;
            filename: string;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        updateVCard: (params: {
            vCard: DAVVCard;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        deleteVCard: (params: {
            vCard: DAVVCard;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        todoQuery: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            filters?: xml_js_types.ElementCompact;
            timezone?: string;
            depth?: DAVDepth;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        todoMultiGet: (params: {
            url: string;
            props: xml_js_types.ElementCompact;
            objectUrls?: string[];
            timezone?: string;
            depth: DAVDepth;
            filters?: xml_js_types.ElementCompact;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<DAVResponse[]>;
        fetchTodos: (params: {
            calendar: DAVCalendar;
            objectUrls?: string[];
            filters?: xml_js_types.ElementCompact;
            timeRange?: {
                start: string;
                end: string;
            };
            expand?: boolean;
            urlFilter?: (url: string) => boolean;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            useMultiGet?: boolean;
            fetchOptions?: RequestInit;
        }) => Promise<DAVObject[]>;
        createTodo: (params: {
            calendar: DAVCalendar;
            iCalString: string;
            filename: string;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        updateTodo: (params: {
            calendarObject: DAVCalendarObject;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
        deleteTodo: (params: {
            calendarObject: DAVCalendarObject;
            headers?: Record<string, string>;
            headersToExclude?: string[];
            fetchOptions?: RequestInit;
        }) => Promise<Response>;
    }>;
    DAVClient: typeof DAVClient;
    DAVNamespace: typeof DAVNamespace;
    DAVNamespaceShort: typeof DAVNamespaceShort;
    DAVAttributeMap: {
        "urn:ietf:params:xml:ns:caldav": string;
        "urn:ietf:params:xml:ns:carddav": string;
        "http://calendarserver.org/ns/": string;
        "http://apple.com/ns/ical/": string;
        "DAV:": string;
    };
};

export { DAVAttributeMap, DAVClient, DAVNamespace, DAVNamespaceShort, addressBookMultiGet, addressBookQuery, batchUpdateTodoFields, calendarMultiGet, calendarQuery, cleanupFalsy, collectionQuery, createAccount, createCalendarObject, createDAVClient, createObject, createTodo, createVCard, davRequest, _default as default, deleteCalendarObject, deleteObject, deleteTodo, deleteVCard, extractEventFields, extractTodoFields, extractVCardFields, fetchAddressBooks, fetchCalendarObjects, fetchCalendarUserAddresses, fetchCalendars, fetchOauthTokens, fetchTodos, fetchVCards, freeBusyQuery, getBasicAuthHeaders, getDAVAttribute, getOauthHeaders, hasValidVEvent, isCollectionDirty, isTodoObject, makeCalendar, propfind, refreshAccessToken, smartCollectionSync, supportedReportSet, syncCalendars, syncCollection, todoMultiGet, todoQuery, updateCalendarObject, updateEventFields, updateObject, updateTodo, updateTodoFields, updateVCard, updateVCardFields, urlContains, urlEquals, validateVCardFields };
export type { BaseFieldUpdaterConfig, DAVAccount, DAVAddressBook, DAVCalendar, DAVCalendarObject, DAVCollection, DAVCredentials, DAVDepth, DAVMethods, DAVObject, DAVRequest, DAVResponse, DAVTokens, DAVVCard, EventFields, FieldUpdateResult, TodoFields, VCardFields };
