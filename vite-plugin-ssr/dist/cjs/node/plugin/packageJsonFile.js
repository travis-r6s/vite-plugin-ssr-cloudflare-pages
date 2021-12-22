"use strict";
/*
 * We create a file `dist/server/package.json` to support ESM users.
 * Otherwise, following error is thrown:
 *   Must use import to load ES Module: dist/server/pageFiles.js
 *   require() of ES modules is not supported.
 *   require() of dist/server/pageFiles.js from node_modules/vite-plugin-ssr/dist/cjs/node/page-files/setup.js is an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which defines all .js files in that package scope as ES modules.
 * Reproduction: https://github.com/brillout/vite-plugin-ssr-server-import-syntax
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageJsonFile = void 0;
const utils_1 = require("../../shared/utils");
const utils_2 = require("./utils");
function packageJsonFile() {
    let ssr;
    return {
        name: 'vite-plugin-ssr:packageJsonFile',
        apply: 'build',
        configResolved(config) {
            ssr = (0, utils_2.isSSR_config)(config);
        },
        generateBundle() {
            (0, utils_1.assert)(typeof ssr === 'boolean');
            if (!ssr)
                return;
            this.emitFile({
                fileName: `package.json`,
                type: 'asset',
                source: getPackageJsonContent(),
            });
        },
    };
}
exports.packageJsonFile = packageJsonFile;
function getPackageJsonContent() {
    return '{ "type": "commonjs" }';
}
//# sourceMappingURL=packageJsonFile.js.map