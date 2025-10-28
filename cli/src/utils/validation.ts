/**
 * Configuration Validation Utility
 * Validates migration config against JSON schema
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { MigrationConfig, MigrationConfigSchema } from '../types/config';

export class ConfigValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats.default(this.ajv); // Add format validators (email, uri, date-time, etc.)
  }

  /**
   * Validate migration config
   * @param config - Migration configuration object
   * @returns Validation result with errors if invalid
   */
  validate(config: unknown): { valid: boolean; errors: string[] } {
    const validate = this.ajv.compile(MigrationConfigSchema);
    const valid = validate(config);

    if (!valid && validate.errors) {
      const errors = validate.errors.map((err) => {
        const path = err.instancePath || 'root';
        return `${path}: ${err.message}`;
      });
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate and throw if invalid
   * @param config - Migration configuration object
   * @throws Error with validation errors
   * @returns void
   */
  validateOrThrow(config: unknown): void {
    const result = this.validate(config);
    if (!result.valid) {
      throw new Error(`Config validation failed:\n${result.errors.join('\n')}`);
    }
  }
}
