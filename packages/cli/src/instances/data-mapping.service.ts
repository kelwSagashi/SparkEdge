/**
 * Data Mapping Service
 * Handles mapping of script output and device data to resource operation input schema
 */

import { Service } from "spark-edge-di";
import type { IDataMapping, IDataField } from "./instance.types";

@Service()
export class DataMappingService {
  /**
   * Extract available fields from multiple sources
   */
  getAvailableFields(
    scriptOutput?: Record<string, any>,
    deviceData?: Record<string, any>,
    customFields?: Record<string, any>,
  ): IDataField[] {
    const fields: IDataField[] = [];

    // From script output
    if (scriptOutput) {
      Object.entries(scriptOutput).forEach(([key, value]) => {
        fields.push({
          label: `Script: ${key}`,
          key: `script.${key}`,
          type: this.inferFieldType(value),
          source: "script_output",
          sourceKey: key,
        });
      });
    }

    // From device data
    if (deviceData) {
      Object.entries(deviceData).forEach(([key, value]) => {
        fields.push({
          label: `Device: ${key}`,
          key: `device.${key}`,
          type: this.inferFieldType(value),
          source: "device_data",
          sourceKey: key,
        });
      });
    }

    // From custom fields
    if (customFields) {
      Object.entries(customFields).forEach(([key, value]) => {
        fields.push({
          label: `Custom: ${key}`,
          key: `custom.${key}`,
          type: this.inferFieldType(value),
          source: "custom",
          sourceKey: key,
        });
      });
    }

    return fields;
  }

  /**
   * Map available data to resource operation input schema
   * Returns a validated mapping object
   */
  createMapping(
    availableFields: IDataField[],
    schemaFields: Record<string, any>,
    mappingConfig: Record<string, string>,
  ): IDataMapping {
    // Validate that all mapped sources exist in available fields
    const validMapping: Record<string, string> = {};
    const errors: string[] = [];

    Object.entries(mappingConfig).forEach(([targetField, sourceField]) => {
      const sourceExists = availableFields.some((f) => f.key === sourceField);
      if (!sourceExists) {
        errors.push(
          `Source field "${sourceField}" not found in available fields`,
        );
      } else {
        validMapping[targetField] = sourceField;
      }
    });

    if (errors.length > 0) {
      throw new Error(`Mapping validation failed: ${errors.join(", ")}`);
    }

    return {
      instance_destination_id: "", // Set by caller
      mapping: validMapping,
      available_fields: availableFields,
      required_fields: Object.keys(schemaFields).filter(
        (f) => schemaFields[f].required,
      ),
    };
  }

  /**
   * Transform data according to mapping
   * Resolves field references and applies transformations
   */
  transformData(
    data: Record<string, any>,
    mapping: IDataMapping,
    transformScript?: string,
  ): Record<string, any> {
    const result: Record<string, any> = {};

    // Apply mapping
    Object.entries(mapping.mapping).forEach(([targetField, sourceField]) => {
      const value = this.resolveFieldValue(sourceField, data);
      result[targetField] = value;
    });

    // Apply custom transform if provided
    if (transformScript) {
      try {
        // Create a safe function from the script
        // In production, this should use a sandboxed environment like vm2 or similar
        const transformFn = new Function(
          "data",
          `return (${transformScript})(data)`,
        );
        const transformed = transformFn(result);
        return transformed;
      } catch (error) {
        console.error("Transform script error:", error);
        // Return non-transformed data on error
      }
    }

    return result;
  }

  /**
   * Validate that required schema fields are present in mapped data
   */
  validateMappedData(
    mappedData: Record<string, any>,
    required_fields?: string[],
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (required_fields) {
      required_fields.forEach((field) => {
        if (mappedData[field] === undefined || mappedData[field] === null) {
          errors.push(`Required field "${field}" is missing or null`);
        }
      });
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get diff between required fields and available mappings
   */
  getMappingGaps(
    requiredFields: string[],
    currentMapping: Record<string, string>,
    availableFields: IDataField[],
  ): { unmapped: string[]; suggestions: Record<string, string[]> } {
    const unmapped: string[] = [];
    const suggestions: Record<string, string[]> = {};

    requiredFields.forEach((field) => {
      if (!currentMapping[field]) {
        unmapped.push(field);
        // Suggest similar field names
        suggestions[field] = availableFields
          .filter((f) => this.isSimilar(field, f.key))
          .map((f) => f.key);
      }
    });

    return { unmapped, suggestions };
  }

  /**
   * Private helpers
   */

  private inferFieldType(value: any): IDataField["type"] {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "object") return "json";
    return "string";
  }

  private resolveFieldValue(fieldPath: string, data: Record<string, any>): any {
    const [source, ...keyParts] = fieldPath.split(".");
    const key = keyParts.join(".");

    if (source === "script") {
      return data.script_output?.[key];
    } else if (source === "device") {
      return data.device_data?.[key];
    } else if (source === "custom") {
      return data.custom_fields?.[key];
    }

    return undefined;
  }

  private isSimilar(str1: string, str2: string): boolean {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Exact match or contains
    if (s1 === s2 || s2.includes(s1) || s1.includes(s2)) {
      return true;
    }

    // Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(s1, s2);
    return distance <= Math.max(s1.length, s2.length) * 0.3;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export default DataMappingService;

