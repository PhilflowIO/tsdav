/**
 * Validate Command
 * Validates configuration and tests authentication
 */

import * as fs from 'fs';
import chalk from 'chalk';
import { MigrationConfig, MigrationType } from '../../types/config';
import { ConfigValidator } from '../../utils/validation';
import { ProviderFactory } from '../../core/ProviderFactory';

export async function validateCommand(options: { config: string; type?: MigrationType }): Promise<void> {
  console.log(chalk.blue('=== Validating Migration Configuration ===\n'));

  try {
    // Load config file
    if (!fs.existsSync(options.config)) {
      throw new Error(`Config file not found: ${options.config}`);
    }

    const configData = fs.readFileSync(options.config, 'utf-8');
    const config: MigrationConfig = JSON.parse(configData);

    // Apply type option
    if (options.type) {
      config.migrationType = options.type;
    } else if (!config.migrationType) {
      config.migrationType = 'calendar';
    }

    const migrationType = config.migrationType;
    const collectionType = migrationType === 'calendar' ? 'calendars' : 'addressbooks';

    // Validate config schema
    console.log(chalk.cyan('Step 1: Validating config schema...'));
    const validator = new ConfigValidator();
    const result = validator.validate(config);

    if (!result.valid) {
      console.error(chalk.red('✗ Config validation failed:'));
      result.errors.forEach((err) => console.error(chalk.red(`  - ${err}`)));
      process.exit(1);
    }
    console.log(chalk.green('✓ Config schema is valid'));

    // Validate provider-specific config
    console.log(chalk.cyan('\nStep 2: Validating provider configurations...'));
    ProviderFactory.validate(config.source);
    console.log(chalk.green('✓ Source provider config is valid'));

    ProviderFactory.validate(config.target);
    console.log(chalk.green('✓ Target provider config is valid'));

    // Test authentication
    console.log(chalk.cyan('\nStep 3: Testing authentication...\n'));

    // Test source authentication
    console.log(chalk.cyan('Source provider:'));
    const sourceClient = await ProviderFactory.createClient(config.source);
    const sourceCollections = migrationType === 'calendar'
      ? await sourceClient.fetchCalendars()
      : await sourceClient.fetchAddressBooks();
    console.log(
      chalk.green(
        `✓ Successfully authenticated with ${config.source.provider} (found ${sourceCollections.length} ${collectionType})`
      )
    );

    if (sourceCollections.length > 0) {
      console.log(chalk.gray(`  ${collectionType.charAt(0).toUpperCase() + collectionType.slice(1)}:`));
      sourceCollections.slice(0, 5).forEach((col: any) => {
        console.log(chalk.gray(`    - ${col.displayName || col.url}`));
      });
      if (sourceCollections.length > 5) {
        console.log(chalk.gray(`    ... and ${sourceCollections.length - 5} more`));
      }
    }

    // Test target authentication
    console.log(chalk.cyan('\nTarget provider:'));
    const targetClient = await ProviderFactory.createClient(config.target);
    const targetCollections = migrationType === 'calendar'
      ? await targetClient.fetchCalendars()
      : await targetClient.fetchAddressBooks();
    console.log(
      chalk.green(
        `✓ Successfully authenticated with ${config.target.provider} (found ${targetCollections.length} ${collectionType})`
      )
    );

    if (targetCollections.length > 0) {
      console.log(chalk.gray(`  ${collectionType.charAt(0).toUpperCase() + collectionType.slice(1)}:`));
      targetCollections.slice(0, 5).forEach((col: any) => {
        console.log(chalk.gray(`    - ${col.displayName || col.url}`));
      });
      if (targetCollections.length > 5) {
        console.log(chalk.gray(`    ... and ${targetCollections.length - 5} more`));
      }
    }

    // Summary
    console.log(chalk.green('\n✓ Configuration is valid and authentication successful!'));
    console.log(chalk.cyan('\nNext Steps:'));
    const typeFlag = migrationType === 'contacts' ? ' --type contacts' : '';
    console.log(`  Preview: dav-migrate preview --config ${options.config}${typeFlag}`);
    console.log(`  Run: dav-migrate run --config ${options.config}${typeFlag}`);
  } catch (error) {
    console.error(chalk.red(`\n✗ Validation failed: ${(error as Error).message}`));
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}
