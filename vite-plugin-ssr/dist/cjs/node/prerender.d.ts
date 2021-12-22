import './page-files/setup';
export { prerender };
/**
 * Render your pages (e.g. for deploying to a static host).
 * @param partial Allow only a subset of pages to be pre-rendered.
 * @param root The root directory of your project (where `vite.config.js` live) (default: `process.cwd()`).
 * @param outDir The build directory of your project (default: `dist`).
 */
declare function prerender({ partial, noExtraDir, root, outDir, clientRouter, parallel, base, }?: {
    partial?: boolean;
    noExtraDir?: boolean;
    root?: string;
    outDir?: string;
    clientRouter?: boolean;
    base?: string;
    parallel?: number;
}): Promise<void>;
//# sourceMappingURL=prerender.d.ts.map