/**
 * Validate Command
 * Validates configuration and tests authentication
 */

import * as fs from 'fs';
import chalk from 'chalk';
import { MigrationConfig } from '../../types/config';
import { ConfigValidator } from '../../utils/validation';
import { ProviderFactory } from '../../core/ProviderFactory';

export async function validateCommand(options: { config: string }): Promise<void> {
  console.log(chalk.blue('=== Validating Migration Configuration ===\n'));

  try {
    // Load config file
    if (!fs.existsSync(options.config)) {
      throw new Error(`Config file not found: ${options.config}`);
    }

    const configData = fs.readFileSync(options.config, 'utf-8');
    const config: MigrationConfig = JSON.parse(configData);

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
    const sourceCalendars = await sourceClient.fetchCalendars();
    console.log(
      chalk.green(
        `✓ Successfully authenticated with ${config.source.provider} (found ${sourceCalendars.length} calendars)`
      )
    );

    if (sourceCalendars.length > 0) {
      console.log(chalk.gray('  Calendars:'));
      sourceCalendars.slice(0, 5).forEach((cal) => {
        console.log(chalk.gray(`    - ${cal.displayName}`));
      });
      if (sourceCalendars.length > 5) {
        console.log(chalk.gray(`    ... and ${sourceCalendars.length - 5} more`));
      }
    }

    // Test target authentication
    console.log(chalk.cyan('\nTarget provider:'));
    const targetClient = await ProviderFactory.createClient(config.target);
    const targetCalendars = await targetClient.fetchCalendars();
    console.log(
      chalk.green(
        `✓ Successfully authenticated with ${config.target.provider} (found ${targetCalendars.length} calendars)`
      )
    );

    if (targetCalendars.length > 0) {
      console.log(chalk.gray('  Calendars:'));
      targetCalendars.slice(0, 5).forEach((cal) => {
        console.log(chalk.gray(`    - ${cal.displayName}`));
      });
      if (targetCalendars.length > 5) {
        console.log(chalk.gray(`    ... and ${targetCalendars.length - 5} more`));
      }
    }

    // Summary
    console.log(chalk.green('\n✓ Configuration is valid and authentication successful!'));
    console.log(chalk.cyan('\nNext Steps:'));
    console.log(`  Preview: dav-migrate preview --config ${options.config}`);
    console.log(`  Run: dav-migrate run --config ${options.config}`);
  } catch (error) {
    console.error(chalk.red(`\n✗ Validation failed: ${(error as Error).message}`));
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}
