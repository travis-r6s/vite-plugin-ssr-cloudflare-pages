import { PageRoutes } from './loadPageRoutes';
export { callOnBeforeRouteHook };
export type { OnBeforeRouteHook };
declare type OnBeforeRouteHook = {
    filePath: string;
    onBeforeRoute: (pageContext: {
        url: string;
    } & Record<string, unknown>) => unknown;
};
declare function callOnBeforeRouteHook(pageContext: {
    url: string;
    _allPageIds: string[];
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: null | OnBeforeRouteHook;
}): Promise<{} | {
    hookError: unknown;
    hookFilePath: string;
    hookName: string;
} | {
    pageContextProvidedByUser: Record<string, unknown> & {
        _pageId?: string | null;
        routeParams?: Record<string, string>;
    };
}>;
//# sourceMappingURL=callOnBeforeRouteHook.d.ts.map