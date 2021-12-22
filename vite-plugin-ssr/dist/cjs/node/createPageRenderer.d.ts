import { renderPage } from './renderPage';
export { createPageRenderer };
export { createPageRendererWasCalled };
declare function createPageRendererWasCalled(): boolean;
declare type RenderPage = typeof renderPage;
declare function createPageRenderer({ viteDevServer, root, outDir, isProduction, base, }: {
    viteDevServer?: unknown;
    root?: string;
    outDir?: string;
    isProduction?: boolean;
    base?: string;
}): RenderPage;
//# sourceMappingURL=createPageRenderer.d.ts.map