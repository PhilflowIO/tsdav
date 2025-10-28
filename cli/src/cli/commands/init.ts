/**
 * Init Command
 * Interactive configuration setup
 */

import * as fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  MigrationConfig,
  ProviderType,
  AuthMethod,
  OAuth2Credentials,
  BasicAuthCredentials,
} from '../../types/config';
import { ProviderFactory } from '../../core/ProviderFactory';

export async function initCommand(options: { output: string }): Promise<void> {
  console.log(chalk.blue('=== DAV Migration Configuration Setup ===\n'));

  try {
    // Source provider configuration
    console.log(chalk.cyan('Source Provider Configuration'));
    const sourceConfig = await promptProviderConfig('source');

    console.log(chalk.cyan('\nTarget Provider Configuration'));
    const targetConfig = await promptProviderConfig('target');

    // Migration options
    console.log(chalk.cyan('\nMigration Options'));
    const migrationOptions = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Overwrite existing events on target?',
        default: false,
      },
      {
        type: 'input',
        name: 'calendarFilter',
        message: 'Calendar filter (regex pattern, leave empty for all):',
        default: '',
      },
    ]);

    // Build config object
    const config: MigrationConfig = {
      source: sourceConfig,
      target: targetConfig,
      options: {
        overwrite: migrationOptions.overwrite,
        ...(migrationOptions.calendarFilter && { calendarFilter: migrationOptions.calendarFilter }),
      },
    };

    // Save config to file
    fs.writeFileSync(options.output, JSON.stringify(config, null, 2), 'utf-8');
    console.log(chalk.green(`\n✓ Configuration saved to: ${options.output}`));

    // Recommend next steps
    console.log(chalk.cyan('\nNext Steps:'));
    console.log(`  1. Review the configuration: ${options.output}`);
    console.log(`  2. Set environment variables (if using env: prefix)`);
    console.log(`  3. Validate: dav-migrate validate --config ${options.output}`);
    console.log(`  4. Preview: dav-migrate preview --config ${options.output}`);
    console.log(`  5. Run: dav-migrate run --config ${options.output}`);
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to create configuration: ${(error as Error).message}`));
    process.exit(1);
  }
}

async function promptProviderConfig(role: 'source' | 'target') {
  // Select provider
  const { provider } = await inquirer.prompt<{ provider: ProviderType }>([
    {
      type: 'list',
      name: 'provider',
      message: `Select ${role} provider:`,
      choices: [
        { name: 'Google Calendar', value: 'google' },
        { name: 'Nextcloud', value: 'nextcloud' },
        { name: 'Baïkal', value: 'baikal' },
        { name: 'Generic CalDAV', value: 'generic' },
      ],
    },
  ]);

  // Get recommended server URL
  const recommendedUrl = ProviderFactory.getRecommendedServerUrl(provider);

  // Server URL
  const { serverUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverUrl',
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} server URL:`,
      default: provider === 'google' ? recommendedUrl : undefined,
      validate: (input) => {
        if (!input) return 'Server URL is required';
        try {
          new URL(input);
          return true;
        } catch {
          return 'Invalid URL format';
        }
      },
    },
  ]);

  // Select auth method
  const authMethods: { name: string; value: AuthMethod }[] =
    provider === 'google'
      ? [{ name: 'OAuth2 (Required for Google)', value: 'Oauth' }]
      : [
          { name: 'Basic Authentication (username + password)', value: 'Basic' },
          { name: 'OAuth2', value: 'Oauth' },
        ];

  const { authMethod } = await inquirer.prompt<{ authMethod: AuthMethod }>([
    {
      type: 'list',
      name: 'authMethod',
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} authentication method:`,
      choices: authMethods,
    },
  ]);

  // Get credentials based on auth method
  let credentials: OAuth2Credentials | BasicAuthCredentials;

  if (authMethod === 'Oauth') {
    credentials = await promptOAuth2Credentials(provider);
  } else {
    credentials = await promptBasicAuthCredentials();
  }

  return {
    provider,
    serverUrl,
    authMethod,
    credentials,
  };
}

async function promptOAuth2Credentials(provider: ProviderType): Promise<OAuth2Credentials> {
  console.log(chalk.yellow('\nOAuth2 Setup:'));

  if (provider === 'google') {
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Create OAuth2 credentials (Desktop app)');
    console.log('3. Enable Google Calendar API');
    console.log('4. Get refresh token (use OAuth2 Playground or authorization code flow)');
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Email address (username):',
      validate: (input) => (input ? true : 'Username is required'),
    },
    {
      type: 'input',
      name: 'clientId',
      message: 'Client ID (or env:VAR_NAME):',
      validate: (input) => (input ? true : 'Client ID is required'),
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: 'Client Secret (or env:VAR_NAME):',
      validate: (input) => (input ? true : 'Client Secret is required'),
    },
    {
      type: 'password',
      name: 'refreshToken',
      message: 'Refresh Token (or env:VAR_NAME):',
      validate: (input) => (input ? true : 'Refresh Token is required'),
    },
  ]);

  return {
    username: answers.username,
    clientId: answers.clientId,
    clientSecret: answers.clientSecret,
    refreshToken: answers.refreshToken,
  };
}

async function promptBasicAuthCredentials(): Promise<BasicAuthCredentials> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username (or env:VAR_NAME):',
      validate: (input) => (input ? true : 'Username is required'),
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password (or env:VAR_NAME):',
      validate: (input) => (input ? true : 'Password is required'),
    },
  ]);

  return {
    username: answers.username,
    password: answers.password,
  };
}
