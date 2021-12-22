import { PageContextBuiltInClient } from './types';
export { releasePageContext };
export { releasePageContextInterim };
declare type PageContextPublic = PageContextBuiltInClient;
declare function releasePageContext<T extends PageContextPublic & {
    _pageContextRetrievedFromServer: null | Record<string, unknown>;
    _comesDirectlyFromServer: boolean;
} & Record<string, unknown>>(pageContext: T): T;
declare function releasePageContextInterim<T extends Record<string, unknown>>(pageContext: T, pageContextRetrievedFromServer: Record<string, unknown>): T;
//# sourceMappingURL=releasePageContext.d.ts.map