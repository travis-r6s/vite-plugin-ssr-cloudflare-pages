"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadViteEntry = void 0;
const assert_1 = require("../../shared/utils/assert");
const path_1 = require("path");
const moduleExists_1 = require("../../shared/utils/moduleExists");
async function loadViteEntry({ devPath, prodPath, isProduction, viteDevServer, errorMessage, }) {
    let moduleExports;
    if (isProduction) {
        const prodPathResolved = (0, path_1.resolve)(prodPath);
        (0, assert_1.assertUsage)((0, moduleExists_1.moduleExists)(prodPathResolved), `${errorMessage}. (Build file ${prodPathResolved} is missing.)`);
        moduleExports = require_(prodPathResolved);
    }
    else {
        (0, assert_1.assert)(viteDevServer);
        const devPathResolved = requireResolve(devPath);
        moduleExports = await viteDevServer.ssrLoadModule(devPathResolved);
    }
    return moduleExports;
}
exports.loadViteEntry = loadViteEntry;
function require_(modulePath) {
    // `req` instead of `require` so that Webpack doesn't do dynamic dependency analysis
    const req = require;
    return req(modulePath);
}
function requireResolve(modulePath) {
    // `req` instead of `require` so that Webpack doesn't do dynamic dependency analysis
    const req = require;
    return req.resolve(modulePath);
}
//# sourceMappingURL=loadViteEntry.js.map