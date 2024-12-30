declare module '@eslint/eslintrc' {
  export type ESLintConfig = {
    env?: Record<string, boolean>;
    extends?: string | string[];
    parser?: string;
    parserOptions?: Record<string, unknown>;
    plugins?: string[];
    rules?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  };

  export class FlatCompat {
    constructor(options?: { baseDirectory?: string });
    extends(...configs: ESLintConfig[]): ESLintConfig[];
  }
}

declare module '@eslint/js' {
  export type ESLintRule = {
    meta?: {
      docs?: {
        description?: string;
        recommended?: boolean;
        url?: string;
      };
      type?: string;
      schema?: unknown[];
    };
    create: (context: unknown) => Record<string, unknown>;
  };

  const js: {
    configs: {
      recommended: {
        rules: Record<string, ESLintRule | number | string | [string | number, ...unknown[]]>;
      };
    };
  };
  export default js;
} 