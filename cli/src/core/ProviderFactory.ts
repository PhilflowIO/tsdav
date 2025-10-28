/**
 * Provider Factory
 * Creates and configures DAVClient instances for different CalDAV providers
 * Handles OAuth2 for Google, Basic Auth for Nextcloud/Baïkal
 */

import { DAVClient } from 'tsdav';
import {
  ProviderConfig,
  OAuth2Credentials,
  BasicAuthCredentials,
  ProviderType,
} from '../types/config';

export class ProviderFactory {
  /**
   * Create and initialize a DAVClient for the given provider configuration
   * @param config - Provider configuration
   * @returns Initialized DAVClient
   * @throws Error if authentication fails
   */
  static async createClient(config: ProviderConfig): Promise<DAVClient> {
    // Expand environment variables in credentials
    const expandedConfig = this.expandEnvVars(config);

    // Create client based on auth method
    const client = this.createDAVClient(expandedConfig);

    // Login (authenticate)
    try {
      await client.login();
      console.log(`✓ Successfully authenticated with ${config.provider} (${config.authMethod})`);
      return client;
    } catch (error) {
      throw new Error(
        `Failed to authenticate with ${config.provider}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create DAVClient instance (not yet authenticated)
   * @param config - Provider configuration
   * @returns DAVClient instance
   */
  private static createDAVClient(config: ProviderConfig): DAVClient {
    if (config.authMethod === 'Oauth') {
      return this.createOAuthClient(config);
    } else {
      return this.createBasicAuthClient(config);
    }
  }

  /**
   * Create OAuth2 client (for Google Calendar)
   * @param config - Provider configuration
   * @returns DAVClient with OAuth2 credentials
   */
  private static createOAuthClient(config: ProviderConfig): DAVClient {
    const creds = config.credentials as OAuth2Credentials;

    // Get provider-specific defaults
    const defaults = this.getProviderDefaults(config.provider);

    return new DAVClient({
      serverUrl: config.serverUrl,
      credentials: {
        tokenUrl: creds.tokenUrl || defaults.tokenUrl || this.getDefaultTokenUrl(config.provider),
        username: creds.username,
        refreshToken: creds.refreshToken,
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
      },
      authMethod: 'Oauth',
      defaultAccountType: 'caldav',
    });
  }

  /**
   * Create Basic Auth client (for Nextcloud, Baïkal, generic)
   * @param config - Provider configuration
   * @returns DAVClient with Basic Auth credentials
   */
  private static createBasicAuthClient(config: ProviderConfig): DAVClient {
    const creds = config.credentials as BasicAuthCredentials;

    return new DAVClient({
      serverUrl: config.serverUrl,
      credentials: {
        username: creds.username,
        password: creds.password,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });
  }

  /**
   * Get provider-specific defaults
   * @param provider - Provider type
   * @returns Provider defaults
   */
  private static getProviderDefaults(provider: ProviderType): Partial<{
    serverUrl: string;
    tokenUrl: string;
  }> {
    switch (provider) {
      case 'google':
        return {
          serverUrl: 'https://apidata.googleusercontent.com/caldav/v2/',
          tokenUrl: 'https://accounts.google.com/o/oauth2/token',
        };
      default:
        return {};
    }
  }

  /**
   * Get default token URL for OAuth2 providers
   * @param provider - Provider type
   * @returns Token URL
   */
  private static getDefaultTokenUrl(provider: ProviderType): string {
    switch (provider) {
      case 'google':
        return 'https://accounts.google.com/o/oauth2/token';
      default:
        throw new Error(`No default token URL for provider: ${provider}`);
    }
  }

  /**
   * Expand environment variables in configuration
   * Supports format: "env:VAR_NAME"
   * @param config - Provider configuration
   * @returns Configuration with expanded environment variables
   */
  private static expandEnvVars(config: ProviderConfig): ProviderConfig {
    const expanded = JSON.parse(JSON.stringify(config)); // Deep clone

    // Expand credentials
    const creds = expanded.credentials as Record<string, string>;
    for (const key in creds) {
      if (typeof creds[key] === 'string' && creds[key].startsWith('env:')) {
        const envVar = creds[key].substring(4); // Remove "env:" prefix
        const envValue = process.env[envVar];

        if (!envValue) {
          throw new Error(
            `Environment variable "${envVar}" not found (referenced in credentials.${key})`
          );
        }

        creds[key] = envValue;
      }
    }

    return expanded;
  }

  /**
   * Validate provider configuration
   * @param config - Provider configuration
   * @throws Error if configuration is invalid
   */
  static validate(config: ProviderConfig): void {
    // Check server URL format
    try {
      new URL(config.serverUrl);
    } catch {
      throw new Error(`Invalid server URL: ${config.serverUrl}`);
    }

    // Check OAuth2 credentials
    if (config.authMethod === 'Oauth') {
      const creds = config.credentials as OAuth2Credentials;
      if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
        throw new Error('OAuth2 requires clientId, clientSecret, and refreshToken');
      }
    }

    // Check Basic Auth credentials
    if (config.authMethod === 'Basic') {
      const creds = config.credentials as BasicAuthCredentials;
      if (!creds.username || !creds.password) {
        throw new Error('Basic Auth requires username and password');
      }
    }
  }

  /**
   * Get recommended server URL for a provider type
   * Useful for interactive config setup
   * @param provider - Provider type
   * @returns Recommended server URL or instruction
   */
  static getRecommendedServerUrl(provider: ProviderType): string {
    switch (provider) {
      case 'google':
        return 'https://apidata.googleusercontent.com/caldav/v2/';
      case 'nextcloud':
        return 'https://your-nextcloud-instance.com (e.g., https://cloud.example.com)';
      case 'baikal':
        return 'https://your-baikal-server.com (e.g., https://dav.example.com)';
      case 'generic':
        return 'https://your-caldav-server.com';
    }
  }

  /**
   * Get required OAuth2 scopes for a provider
   * @param provider - Provider type
   * @returns Array of OAuth2 scopes
   */
  static getRequiredScopes(provider: ProviderType): string[] {
    switch (provider) {
      case 'google':
        return ['https://www.googleapis.com/auth/calendar'];
      default:
        return [];
    }
  }
}
