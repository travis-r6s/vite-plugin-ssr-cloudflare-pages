export { resolveRouteFunction };
export { assertRouteParams };
declare function resolveRouteFunction(pageRouteFileExports: {
    default: Function;
    iKnowThePerformanceRisksOfAsyncRouteFunctions?: boolean;
}, urlPathname: string, pageContext: Record<string, unknown>, pageRouteFilePath: string): Promise<{
    hookError: unknown;
    hookName: string;
    hookFilePath: string;
} | null | {
    precedence: number | null;
    routeParams: Record<string, string>;
}>;
declare function assertRouteParams<T>(result: T, errPrefix: string): asserts result is T & {
    routeParams?: Record<string, string>;
};
//# sourceMappingURL=resolveRouteFunction.d.ts.map