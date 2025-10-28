/**
 * Resume Command
 * Resume migration from state file
 */

import * as fs from 'fs';
import chalk from 'chalk';
import { MigrationConfig } from '../../types/config';
import { ConfigValidator } from '../../utils/validation';
import { StateManager } from '../../core/StateManager';
import { MigrationEngine } from '../../core/MigrationEngine';

export async function resumeCommand(options: {
  state: string;
  config: string;
  overwrite: boolean;
}): Promise<void> {
  console.log(chalk.blue('=== Resuming Calendar Migration ===\n'));

  try {
    // Load state file
    if (!fs.existsSync(options.state)) {
      throw new Error(`State file not found: ${options.state}`);
    }

    const stateManager = StateManager.loadFromFile(options.state);
    const state = stateManager.getState();

    // Check if already completed
    if (state.status === 'completed') {
      console.log(chalk.yellow('Migration already completed!'));
      stateManager.printSummary();
      return;
    }

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
    };

    // Show resume info
    console.log(chalk.cyan('Migration Info:'));
    console.log(`  ID: ${state.migrationId}`);
    console.log(`  Started: ${state.startedAt}`);
    console.log(`  Source: ${state.sourceProvider} → Target: ${state.targetProvider}`);
    console.log(`  Status: ${state.status}`);
    console.log(`  Progress: ${stateManager.getOverallProgress()}%\n`);

    // Create migration engine with existing state
    const engine = new MigrationEngine(config, stateManager);

    // Initialize clients
    await engine.initialize();

    // Resume migration
    await engine.migrate();

    // Print summary
    stateManager.printSummary();

    // Cleanup
    await engine.cleanup();

    console.log(chalk.green('\n✓ Migration resumed and completed successfully!'));
  } catch (error) {
    console.error(chalk.red(`\n✗ Resume failed: ${(error as Error).message}`));
    if (process.env.DEBUG) {
      console.error((error as Error).stack);
    }
    process.exit(1);
  }
}
