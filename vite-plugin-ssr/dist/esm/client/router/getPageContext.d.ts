import type { PageContextUrls } from '../../shared/addComputedUrlProps';
import { ServerFiles } from './getGlobalContext';
import { PageContextForRoute } from '../../shared/route';
export { getPageContext };
declare type PageContextAddendum = {
    _pageId: string;
    _pageContextRetrievedFromServer: null | Record<string, unknown>;
    isHydration: boolean;
    _comesDirectlyFromServer: boolean;
    Page: unknown;
    pageExports: Record<string, unknown>;
} & Record<string, unknown>;
declare function getPageContext(pageContext: {
    url: string;
    _serverFiles: ServerFiles;
    _isFirstRender: boolean;
} & PageContextUrls & PageContextForRoute): Promise<PageContextAddendum>;
//# sourceMappingURL=getPageContext.d.ts.map