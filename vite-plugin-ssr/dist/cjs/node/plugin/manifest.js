"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifest = void 0;
const utils_1 = require("../../shared/utils");
const utils_2 = require("./utils");
function manifest() {
    let base;
    let ssr;
    return {
        name: 'vite-plugin-ssr:manifest',
        apply: 'build',
        configResolved(config) {
            base = config.base;
            ssr = (0, utils_2.isSSR_config)(config);
        },
        generateBundle(_, bundle) {
            if (ssr)
                return;
            (0, utils_1.assert)(typeof base === 'string');
            (0, utils_1.assert)(typeof ssr === 'boolean');
            const manifest = {
                version: utils_1.projectInfo.projectVersion,
                usesClientRouter: includesClientSideRouter(bundle),
                base,
            };
            this.emitFile({
                fileName: `vite-plugin-ssr.json`,
                type: 'asset',
                source: JSON.stringify(manifest, null, 2),
            });
        },
    };
}
exports.manifest = manifest;
function includesClientSideRouter(bundle) {
    const filePath = require.resolve('../../../../dist/esm/client/router/useClientRouter.js');
    for (const file of Object.keys(bundle)) {
        const bundleFile = bundle[file];
        (0, utils_1.assert)(bundleFile);
        const modules = bundleFile.modules || {};
        if (filePath in modules || (0, utils_1.normalizePath)(filePath) in modules) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=manifest.js.map