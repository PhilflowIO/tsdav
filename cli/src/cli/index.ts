#!/usr/bin/env node

/**
 * DAV Migration CLI
 * Command-line interface for migrating calendars between CalDAV providers
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import { initCommand } from './commands/init';
import { validateCommand } from './commands/validate';
import { previewCommand } from './commands/preview';
import { runCommand } from './commands/run';
import { resumeCommand } from './commands/resume';

// Load environment variables from .env file
dotenv.config();

const program = new Command();

program
  .name('dav-migrate')
  .description('DSGVO-compliant CLI tool for migrating calendars between CalDAV providers')
  .version('0.1.0');

// Init command - Interactive config setup
program
  .command('init')
  .description('Create a new migration configuration file interactively')
  .option('-o, --output <path>', 'Output config file path', 'migration-config.json')
  .action(initCommand);

// Validate command - Validate config and test authentication
program
  .command('validate')
  .description('Validate migration configuration and test authentication')
  .requiredOption('-c, --config <path>', 'Path to migration config file')
  .action(validateCommand);

// Preview command - Dry-run to preview what would be migrated
program
  .command('preview')
  .description('Preview what would be migrated (dry-run mode)')
  .requiredOption('-c, --config <path>', 'Path to migration config file')
  .option('-s, --state <path>', 'Load existing state file (for resume preview)')
  .action(previewCommand);

// Run command - Execute migration
program
  .command('run')
  .description('Execute calendar migration')
  .requiredOption('-c, --config <path>', 'Path to migration config file')
  .option('-s, --state <path>', 'State file path', '.migration-state.json')
  .option('--overwrite', 'Overwrite existing events on target', false)
  .option('--interactive', 'Interactive conflict resolution', false)
  .action(runCommand);

// Resume command - Resume from state file
program
  .command('resume')
  .description('Resume migration from state file')
  .requiredOption('-s, --state <path>', 'Path to state file')
  .requiredOption('-c, --config <path>', 'Path to migration config file')
  .option('--overwrite', 'Overwrite existing events on target', false)
  .action(resumeCommand);

// Global error handler
process.on('unhandledRejection', (error: Error) => {
  console.error(chalk.red('\n✗ Unhandled error:'), error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
