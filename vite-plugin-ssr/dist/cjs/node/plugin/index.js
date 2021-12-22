"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssr = exports.plugin = void 0;
const utils_1 = require("../../shared/utils");
const build_1 = require("./build");
const dev_1 = require("./dev");
const manifest_1 = require("./manifest");
const packageJsonFile_1 = require("./packageJsonFile");
const vite_plugin_import_build_1 = require("vite-plugin-import-build");
const getImportBuildCode_1 = require("./getImportBuildCode");
const transformPageServerFiles_1 = require("./transformPageServerFiles");
const removeRequireHookPlugin_1 = require("./removeRequireHookPlugin");
exports.default = plugin;
// Return as `any` to avoid Plugin type mismatches when there are multiple Vite versions installed
function plugin() {
    const plugins = [
        (0, dev_1.dev)(),
        (0, build_1.build)(),
        (0, manifest_1.manifest)(),
        (0, vite_plugin_import_build_1.importBuild)((0, getImportBuildCode_1.getImportBuildCode)()),
        (0, packageJsonFile_1.packageJsonFile)(),
        (0, transformPageServerFiles_1.transformPageServerFiles)(),
        (0, removeRequireHookPlugin_1.removeRequireHookPlugin)(),
    ];
    return plugins;
}
exports.plugin = plugin;
exports.ssr = plugin;
// Enable `const ssr = require('vite-plugin-ssr/plugin')`
// This lives at the end of the file to ensure it happens after all assignments to `exports`
module.exports = Object.assign(exports.default, exports);
Object.defineProperty(plugin, 'apply', {
    enumerable: true,
    get: () => {
        (0, utils_1.assertUsage)(false, 'Make sure to instantiate the `ssr` plugin (`import ssr from "vite-plugin-ssr"`): include `ssr()` instead of `ssr` in the `plugins` list of your `vite.config.js`.');
    },
});
//# sourceMappingURL=index.js.map