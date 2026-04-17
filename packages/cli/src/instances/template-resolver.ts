/**
 * Utility to resolve template strings in objects/strings using a context object.
 * Replaces {{path.to.value}} with actual values from context.
 */
export class TemplateResolver {
  /**
   * Recursively resolves templates in an object or string.
   */
  public static resolve<T>(input: T, context: Record<string, unknown>): T {
    if (typeof input === 'string') {
      return this.resolveString(input, context) as unknown as T;
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
    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getDeepValue(context, path.trim());
      return value !== undefined ? String(value) : match;
    });
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
