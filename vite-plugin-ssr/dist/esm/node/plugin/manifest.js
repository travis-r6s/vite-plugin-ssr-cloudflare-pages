import { assert, normalizePath, projectInfo } from '../../shared/utils';
import { isSSR_config } from './utils';
export { manifest };
function manifest() {
    let base;
    let ssr;
    return {
        name: 'vite-plugin-ssr:manifest',
        apply: 'build',
        configResolved(config) {
            base = config.base;
            ssr = isSSR_config(config);
        },
        generateBundle(_, bundle) {
            if (ssr)
                return;
            assert(typeof base === 'string');
            assert(typeof ssr === 'boolean');
            const manifest = {
                version: projectInfo.projectVersion,
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
function includesClientSideRouter(bundle) {
    const filePath = require.resolve('../../../../dist/esm/client/router/useClientRouter.js');
    for (const file of Object.keys(bundle)) {
        const bundleFile = bundle[file];
        assert(bundleFile);
        const modules = bundleFile.modules || {};
        if (filePath in modules || normalizePath(filePath) in modules) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=manifest.js.map