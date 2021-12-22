export { setViteManifest };
export { getViteManifest };
export { ViteManifest };
declare type ViteManifest = Record<string, {
    src?: string;
    file: string;
    css?: string[];
    assets?: string[];
    isEntry?: boolean;
    isDynamicEntry?: boolean;
    imports?: string[];
    dynamicImports?: string[];
}>;
declare function getViteManifest(): {
    clientManifest: null | ViteManifest;
    serverManifest: null | ViteManifest;
    clientManifestPath: string;
    serverManifestPath: string;
};
declare function setViteManifest(manifests: {
    clientManifest: unknown;
    serverManifest: unknown;
}): void;
//# sourceMappingURL=getViteManifest.d.ts.map