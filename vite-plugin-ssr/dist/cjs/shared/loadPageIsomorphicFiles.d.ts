import { AllPageFiles } from './getPageFiles';
import { OnBeforeRenderHook } from './onBeforeRenderHook';
export { loadPageIsomorphicFiles };
export type { PageIsomorphicFile };
export type { PageIsomorphicFileDefault };
declare type PageIsomorphicFile = null | {
    filePath: string;
    onBeforeRenderHook: null | OnBeforeRenderHook;
    fileExports: {
        skipOnBeforeRenderDefaultHook?: boolean;
        onBeforeRender?: Function;
    };
};
declare type PageIsomorphicFileDefault = null | {
    filePath: string;
    onBeforeRenderHook: OnBeforeRenderHook;
};
declare function loadPageIsomorphicFiles(pageContext: {
    _pageId: string;
    _allPageFiles: Pick<AllPageFiles, '.page'>;
}): Promise<{
    pageIsomorphicFile: PageIsomorphicFile;
    pageIsomorphicFileDefault: PageIsomorphicFileDefault;
    Page: unknown;
    pageExports: Record<string, unknown>;
}>;
//# sourceMappingURL=loadPageIsomorphicFiles.d.ts.map