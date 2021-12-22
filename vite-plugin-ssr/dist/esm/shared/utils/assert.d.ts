export { assert };
export { assertUsage };
export { assertWarning };
export { getPluginError };
declare function assert(condition: unknown, debugInfo?: unknown): asserts condition;
declare function assertUsage(condition: unknown, errorMessage: string): asserts condition;
declare function getPluginError(errorMessage: string): Error;
declare function assertWarning(condition: unknown, errorMessage: string): void;
//# sourceMappingURL=assert.d.ts.map