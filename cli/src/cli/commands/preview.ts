/**
 * Preview Command
 * Dry-run mode to preview what would be migrated
 */

import * as fs from 'fs';
import chalk from 'chalk';
import { MigrationConfig } from '../../types/config';
import { ConfigValidator } from '../../utils/validation';
import { StateManager } from '../../core/StateManager';
import { MigrationEngine } from '../../core/MigrationEngine';

export async function previewCommand(options: { config: string; state?: string }): Promise<void> {
  console.log(chalk.blue('=== Migration Preview (Dry-Run) ===\n'));

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

    // Enable dry-run mode
    config.options = {
      ...config.options,
      dryRun: true,
    };

    // Initialize state manager (load existing if provided)
    let stateManager: StateManager;
    if (options.state && fs.existsSync(options.state)) {
      console.log(chalk.cyan(`Loading existing state from: ${options.state}\n`));
      stateManager = StateManager.loadFromFile(options.state);
    } else {
      stateManager = new StateManager('.preview-state.json', false); // Don't auto-save for preview
    }

    // Create migration engine
    const engine = new MigrationEngine(config, stateManager);

    // Initialize and run preview
    await engine.initialize();
    await engine.migrate();

    // Print preview summary
    console.log(chalk.cyan('\n=== Preview Complete ==='));
    console.log(
      chalk.yellow(
        'This was a dry-run. No changes were made to the target. Run with "run" command to execute migration.'
      )
    );
  } catch (error) {
    console.error(chalk.red(`\n✗ Preview failed: ${(error as Error).message}`));
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}
