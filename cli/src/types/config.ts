/**
 * Configuration types for DAV migration tool
 * DSGVO-compliant: Zero content storage, metadata only
 */

/**
 * Supported CalDAV provider types
 */
export type ProviderType = 'google' | 'nextcloud' | 'baikal' | 'generic';

/**
 * Authentication method types
 */
export type AuthMethod = 'Basic' | 'Oauth';

/**
 * Base credentials interface
 */
export interface BaseCredentials {
  username: string;
}

/**
 * OAuth2 credentials for Google Calendar
 */
export interface OAuth2Credentials extends BaseCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tokenUrl?: string; // Optional, defaults to Google's token URL
}

/**
 * Basic authentication credentials
 */
export interface BasicAuthCredentials extends BaseCredentials {
  password: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  provider: ProviderType;
  serverUrl: string;
  authMethod: AuthMethod;
  credentials: OAuth2Credentials | BasicAuthCredentials;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  source: ProviderConfig;
  target: ProviderConfig;
  options?: MigrationOptions;
}

/**
 * Migration options
 */
export interface MigrationOptions {
  /** Overwrite existing events on target (based on UID) */
  overwrite?: boolean;
  /** Interactive mode - ask user for conflicts */
  interactive?: boolean;
  /** Dry-run mode - preview without migrating */
  dryRun?: boolean;
  /** Rate limit in requests per second */
  rateLimit?: {
    source?: number;
    target?: number;
  };
  /** Filter calendars by display name (regex pattern) */
  calendarFilter?: string;
  /** Time range for events to migrate */
  timeRange?: {
    start?: string; // ISO 8601 format
    end?: string; // ISO 8601 format
  };
}

/**
 * Migration state - DSGVO-compliant (metadata only, zero content)
 */
export interface MigrationState {
  migrationId: string;
  startedAt: string; // ISO 8601 timestamp
  completedAt?: string; // ISO 8601 timestamp
  sourceProvider: ProviderType;
  targetProvider: ProviderType;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  calendars: CalendarMigrationState[];
  summary?: MigrationSummary;
}

/**
 * Per-calendar migration state
 */
export interface CalendarMigrationState {
  sourceCalendarUrl: string;
  sourceCalendarName: string; // Display name for user reference
  targetCalendarUrl: string;
  targetCalendarName: string;
  totalEvents: number;
  processedEvents: number;
  /** UIDs of successfully migrated events */
  migratedUIDs: string[];
  /** UIDs that were skipped (already existed on target) */
  skippedUIDs: string[];
  /** UIDs that failed with error details */
  failedUIDs: FailedEvent[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string; // ISO 8601 timestamp
  completedAt?: string; // ISO 8601 timestamp
}

/**
 * Failed event record (DSGVO-compliant: UID + error code only)
 */
export interface FailedEvent {
  uid: string;
  error: string; // HTTP status code or error message
  timestamp: string; // ISO 8601 timestamp
}

/**
 * Migration summary statistics
 */
export interface MigrationSummary {
  totalCalendars: number;
  totalEvents: number;
  migratedEvents: number;
  skippedEvents: number;
  failedEvents: number;
  duration: number; // milliseconds
}

/**
 * JSON Schema for MigrationConfig validation
 */
export const MigrationConfigSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['google', 'nextcloud', 'baikal', 'generic'],
        },
        serverUrl: {
          type: 'string',
          format: 'uri',
        },
        authMethod: {
          type: 'string',
          enum: ['Basic', 'Oauth'],
        },
        credentials: {
          type: 'object',
          oneOf: [
            {
              // OAuth2 credentials
              properties: {
                username: { type: 'string', format: 'email' },
                clientId: { type: 'string', minLength: 1 },
                clientSecret: { type: 'string', minLength: 1 },
                refreshToken: { type: 'string', minLength: 1 },
                tokenUrl: { type: 'string', format: 'uri' },
              },
              required: ['username', 'clientId', 'clientSecret', 'refreshToken'],
              additionalProperties: false,
            },
            {
              // Basic auth credentials
              properties: {
                username: { type: 'string', minLength: 1 },
                password: { type: 'string', minLength: 1 },
              },
              required: ['username', 'password'],
              additionalProperties: false,
            },
          ],
        },
      },
      required: ['provider', 'serverUrl', 'authMethod', 'credentials'],
      additionalProperties: false,
    },
    target: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['google', 'nextcloud', 'baikal', 'generic'],
        },
        serverUrl: {
          type: 'string',
          format: 'uri',
        },
        authMethod: {
          type: 'string',
          enum: ['Basic', 'Oauth'],
        },
        credentials: {
          type: 'object',
          oneOf: [
            {
              // OAuth2 credentials
              properties: {
                username: { type: 'string', format: 'email' },
                clientId: { type: 'string', minLength: 1 },
                clientSecret: { type: 'string', minLength: 1 },
                refreshToken: { type: 'string', minLength: 1 },
                tokenUrl: { type: 'string', format: 'uri' },
              },
              required: ['username', 'clientId', 'clientSecret', 'refreshToken'],
              additionalProperties: false,
            },
            {
              // Basic auth credentials
              properties: {
                username: { type: 'string', minLength: 1 },
                password: { type: 'string', minLength: 1 },
              },
              required: ['username', 'password'],
              additionalProperties: false,
            },
          ],
        },
      },
      required: ['provider', 'serverUrl', 'authMethod', 'credentials'],
      additionalProperties: false,
    },
    options: {
      type: 'object',
      properties: {
        overwrite: { type: 'boolean' },
        interactive: { type: 'boolean' },
        dryRun: { type: 'boolean' },
        rateLimit: {
          type: 'object',
          properties: {
            source: { type: 'number', minimum: 0.1 },
            target: { type: 'number', minimum: 0.1 },
          },
          additionalProperties: false,
        },
        calendarFilter: { type: 'string' },
        timeRange: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  required: ['source', 'target'],
  additionalProperties: false,
};
