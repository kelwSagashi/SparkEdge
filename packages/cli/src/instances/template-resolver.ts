import { JSONPath } from 'jsonpath-plus';

/**
 * Utility to resolve template strings in objects/strings using a context object.
 * Replaces {{path.to.value}} or {{$.path.to.value || 'fallback'}} with actual values from context.
 */
export class TemplateResolver {
  /**
   * Recursively resolves templates in an object or string.
   */
  public static resolve<T>(input: T, context: Record<string, unknown>): T {
    if (typeof input === 'string') {
      const resolved = this.resolveString(input, context);
      
      // If the entire string was a single template, return the actual type (not coerced to string)
      if (input.startsWith('{{') && input.endsWith('}}') && !input.slice(2, -2).includes('{{')) {
        const path = input.slice(2, -2).trim();
        return this.evaluateExpression(path, context) as unknown as T;
      }
      
      return resolved as unknown as T;
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.resolve(item, context)) as unknown as T;
    }

    if (input !== null && typeof input === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.resolve(value, context);
      }
      return result as unknown as T;
    }

    return input;
  }

  /**
   * Resolves a string containing multiple {{templates}}.
   */
  private static resolveString(str: string, context: Record<string, unknown>): string {
    return str.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      const value = this.evaluateExpression(expression.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Evaluates a simple expression (supporting || and JSONPath/DotPath).
   */
  private static evaluateExpression(expr: string, context: Record<string, unknown>): unknown {
    // Support basic || operator
    const parts = expr.split('||').map(p => p.trim());
    
    for (const part of parts) {
      // 1. Check for literals (string)
      if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
        return part.slice(1, -1);
      }

      // 2. Check for literals (number)
      if (!isNaN(Number(part)) && part !== '') {
        return Number(part);
      }

      // 3. Resolve as path
      let value;
      if (part.startsWith('$')) {
        // JSONPath resolution
        try {
          const matches = JSONPath({ path: part, json: context }) as unknown[];
          value = matches.length > 0 ? matches[0] : undefined;
        } catch {
          value = undefined;
        }
      } else {
        // DotPath resolution
        value = this.getDeepValue(context, part);
      }

      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Helper to retrieve a nested value from an object using a dot-path.
   */
  private static getDeepValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: any, part: string) => {
      if (acc && typeof acc === 'object') {
        return acc[part];
      }
      return undefined;
    }, obj);
  }
}

