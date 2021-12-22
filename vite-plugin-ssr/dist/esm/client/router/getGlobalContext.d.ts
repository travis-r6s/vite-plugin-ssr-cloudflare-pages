export { getGlobalContext };
export type { ServerFiles };
declare function getGlobalContext(): Promise<{
    _parseUrl: null;
    _baseUrl: string;
} & {
    _allPageFiles: import("../../shared/getPageFiles").AllPageFiles;
} & {
    _allPageIds: string[];
} & {
    _pageRoutes: import("../../shared/route/loadPageRoutes").PageRoutes;
    _onBeforeRouteHook: import("../../shared/route/callOnBeforeRouteHook").OnBeforeRouteHook | null;
} & {
    _serverFiles: ServerFiles;
}>;
declare type ServerFiles = {
    filePath: string;
    fileExports: {
        hasExportOnBeforeRender: boolean;
    };
}[];
//# sourceMappingURL=getGlobalContext.d.ts.map