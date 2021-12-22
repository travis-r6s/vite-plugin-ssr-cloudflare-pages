import type { ViteDevServer } from 'vite';
export { loadViteEntry };
declare function loadViteEntry({ devPath, prodPath, isProduction, viteDevServer, errorMessage, }: {
    devPath: string;
    prodPath: string;
    isProduction: boolean;
    viteDevServer: undefined | ViteDevServer;
    errorMessage: string;
}): Promise<unknown>;
//# sourceMappingURL=loadViteEntry.d.ts.map