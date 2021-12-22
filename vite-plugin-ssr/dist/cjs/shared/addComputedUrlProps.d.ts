import { parseUrl } from './utils';
export { addComputedUrlProps };
export type { PageContextUrls };
export type { PageContextUrlSource };
declare type UrlParsed = {
    origin: null | string;
    pathname: string;
    pathnameWithBaseUrl: string;
    pathnameWithoutBaseUrl?: never;
    hasBaseUrl: boolean;
    search: Record<string, string>;
    searchString: null | string;
    hash: string;
    hashString: null | string;
};
declare type PageContextUrls = {
    urlPathname: string;
    urlParsed: UrlParsed;
};
declare function addComputedUrlProps<PageContext extends Record<string, unknown> & PageContextUrlSource>(pageContext: PageContext): asserts pageContext is PageContext & PageContextUrls;
declare type PageContextUrlSource = {
    url: string;
    _baseUrl: string;
    _parseUrl: null | typeof parseUrl;
};
//# sourceMappingURL=addComputedUrlProps.d.ts.map