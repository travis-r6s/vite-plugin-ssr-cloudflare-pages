export { assertPageContextProvidedByUser };
declare function assertPageContextProvidedByUser(pageContextProvidedByUser: unknown, hook: {
    hookFilePath: string;
    hookName: 'onBeforeRender' | 'render' | 'onBeforeRoute';
}): asserts pageContextProvidedByUser is Record<string, unknown>;
//# sourceMappingURL=assertPageContextProvidedByUser.d.ts.map