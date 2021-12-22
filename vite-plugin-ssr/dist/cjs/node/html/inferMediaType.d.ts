export { inferMediaType };
export { MediaType };
declare type MediaType = null | {
    preloadType: 'image' | 'script' | 'font' | 'style';
    mediaType: 'text/javascript' | 'text/css' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/svg+xml' | 'font/ttf' | 'font/woff' | 'font/woff2';
};
declare function inferMediaType(href: string): MediaType;
//# sourceMappingURL=inferMediaType.d.ts.map