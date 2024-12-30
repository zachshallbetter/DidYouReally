declare module '@eslint/eslintrc' {
  export class FlatCompat {
    constructor(options?: { baseDirectory?: string });
    extends(...configs: any[]): any[];
  }
}

declare module '@eslint/js' {
  const js: {
    configs: {
      recommended: {
        rules: Record<string, any>;
      };
    };
  };
  export default js;
} 