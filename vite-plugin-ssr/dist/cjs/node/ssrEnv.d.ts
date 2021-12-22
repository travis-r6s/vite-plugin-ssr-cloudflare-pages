import type { ViteDevServer } from 'vite';
export { setSsrEnv };
export { getSsrEnv };
export type { SsrEnv };
declare type SsrEnv = {
    isProduction: false;
    viteDevServer: ViteDevServer;
    root: string;
    outDir: string;
    baseUrl: string;
} | {
    isProduction: true;
    viteDevServer: undefined;
    root?: string | undefined;
    outDir: string;
    baseUrl: string;
};
declare function getSsrEnv(): SsrEnv;
declare function setSsrEnv(ssrEnv: SsrEnv): void;
declare global {
    var __vite_ssr_plugin: SsrEnv;
}
//# sourceMappingURL=ssrEnv.d.ts.map