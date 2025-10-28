/**
 * Run Command
 * Execute calendar migration
 */

import * as fs from 'fs';
import chalk from 'chalk';
import { MigrationConfig } from '../../types/config';
import { ConfigValidator } from '../../utils/validation';
import { StateManager } from '../../core/StateManager';
import { MigrationEngine } from '../../core/MigrationEngine';

export async function runCommand(options: {
  config: string;
  state: string;
  overwrite: boolean;
  interactive: boolean;
}): Promise<void> {
  console.log(chalk.blue('=== Starting Calendar Migration ===\n'));

  try {
    // Load config file
    if (!fs.existsSync(options.config)) {
      throw new Error(`Config file not found: ${options.config}`);
    }

    const configData = fs.readFileSync(options.config, 'utf-8');
    const configRaw = JSON.parse(configData);

    // Validate config
    const validator = new ConfigValidator();
    validator.validateOrThrow(configRaw);
    const config = configRaw as MigrationConfig;

    // Apply CLI options
    config.options = {
      ...config.options,
      overwrite: options.overwrite || config.options?.overwrite || false,
      interactive: options.interactive || config.options?.interactive || false,
    };

    // Check if state file already exists (resume scenario)
    if (fs.existsSync(options.state)) {
      console.log(chalk.yellow(`Warning: State file already exists: ${options.state}`));
      console.log(
        chalk.yellow(
          'This may indicate a previous migration. Use "resume" command to continue from where it left off.'
        )
      );
      console.log(chalk.yellow('Continuing will create a new migration...\n'));
    }

    // Initialize state manager
    const stateManager = new StateManager(options.state);

    // Create migration engine
    const engine = new MigrationEngine(config, stateManager);

    // Initialize clients
    await engine.initialize();

    // Execute migration
    await engine.migrate();

    // Print summary
    stateManager.printSummary();

    // Cleanup
    await engine.cleanup();

    console.log(chalk.green('\n✓ Migration completed successfully!'));
  } catch (error) {
    console.error(chalk.red(`\n✗ Migration failed: ${(error as Error).message}`));
    if (process.env.DEBUG) {
      console.error((error as Error).stack);
    }
    process.exit(1);
  }
}
