/// <reference types="node" />
import { PageRoutes } from '../shared/route';
import { AllPageFiles } from '../shared/getPageFiles';
import { PromiseType, parseUrl } from '../shared/utils';
import { PageIsomorphicFile, PageIsomorphicFileDefault } from '../shared/loadPageIsomorphicFiles';
import { OnBeforeRenderHook } from '../shared/onBeforeRenderHook';
import { StreamPipeNode, StreamPipeWeb, StreamReadableNode, StreamReadableWeb } from './html/stream';
export { renderPageWithoutThrowing };
export type { renderPage };
export { prerenderPage };
export { renderStatic404Page };
export { getGlobalContext };
export { loadPageFiles };
export type { GlobalContext };
export { loadOnBeforePrerenderHook };
export { throwPrerenderError };
declare type PageFiles = PromiseType<ReturnType<typeof loadPageFiles>>;
declare type GlobalContext = PromiseType<ReturnType<typeof getGlobalContext>>;
declare function renderPage<PageContextAdded extends {}, PageContextInit extends {
    url: string;
}>(pageContextInit: PageContextInit): Promise<PageContextInit & (({
    httpResponse: HttpResponse;
} & PageContextAdded) | ({
    httpResponse: null;
} & Partial<PageContextAdded>))>;
declare function renderPageWithoutThrowing(pageContextInit: Parameters<typeof renderPage>[0]): ReturnType<typeof renderPage>;
declare type StatusCode = 200 | 404 | 500;
declare type ContentType = 'application/json' | 'text/html';
declare type HttpResponse = {
    statusCode: StatusCode;
    contentType: ContentType;
    body: string;
    getBody: () => Promise<string>;
    getNodeStream: () => Promise<StreamReadableNode>;
    getWebStream: () => Promise<StreamReadableWeb>;
    pipeToNodeWritable: StreamPipeNode;
    pipeToWebWritable: StreamPipeWeb;
};
declare function prerenderPage(pageContext: {
    url: string;
    routeParams: Record<string, string>;
    _isPreRendering: true;
    _pageId: string;
    _usesClientRouter: boolean;
    _pageContextAlreadyProvidedByPrerenderHook?: true;
} & PageFiles & GlobalContext): Promise<{
    documentHtml: string;
    pageContextSerialized: null;
} | {
    documentHtml: string;
    pageContextSerialized: string;
}>;
declare function renderStatic404Page(globalContext: GlobalContext & {
    _isPreRendering: true;
}): Promise<{
    documentHtml: string;
    pageContextSerialized: null;
} | {
    documentHtml: string;
    pageContextSerialized: string;
} | null>;
declare type PageServerFileProps = {
    filePath: string;
    onBeforeRenderHook: null | OnBeforeRenderHook;
    fileExports: {
        render?: Function;
        prerender?: Function;
        onBeforeRender?: Function;
        doNotPrerender?: true;
        setPageProps: never;
        passToClient?: string[];
        skipOnBeforeRenderDefaultHook?: boolean;
    };
};
declare function loadPageFiles(pageContext: {
    _pageId: string;
    _baseUrl: string;
    _allPageFiles: AllPageFiles;
    _isPreRendering: boolean;
}): Promise<{
    Page: unknown;
    pageExports: Record<string, unknown>;
    _pageIsomorphicFile: PageIsomorphicFile;
    _pageIsomorphicFileDefault: PageIsomorphicFileDefault;
    _pageServerFile: PageServerFileProps | null;
    _pageServerFileDefault: PageServerFileProps | null;
    _pageClientPath: string;
} & {
    _passToClient: string[];
} & {
    _getPageAssets: () => Promise<{
        src: string;
        assetType: "script" | "style" | "preload";
        mediaType: "text/javascript" | "text/css" | "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/svg+xml" | "font/ttf" | "font/woff" | "font/woff2" | null;
        preloadType: "font" | "script" | "style" | "image" | null;
    }[]>;
}>;
declare type OnBeforePrerenderHook = (globalContext: {
    _pageRoutes: PageRoutes;
}) => unknown;
declare function loadOnBeforePrerenderHook(globalContext: {
    _allPageFiles: AllPageFiles;
}): Promise<null | {
    onBeforePrerenderHook: OnBeforePrerenderHook;
    hookFilePath: string;
}>;
declare function _parseUrl(url: string, baseUrl: string): ReturnType<typeof parseUrl> & {
    isPageContextRequest: boolean;
};
declare function getGlobalContext(): Promise<{
    _parseUrl: typeof _parseUrl;
    _baseUrl: string;
} & {
    _allPageFiles: AllPageFiles;
} & {
    _allPageIds: string[];
} & {
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: import("../shared/route/callOnBeforeRouteHook").OnBeforeRouteHook | null;
}>;
declare function throwPrerenderError(err: unknown): void;
//# sourceMappingURL=renderPage.d.ts.map