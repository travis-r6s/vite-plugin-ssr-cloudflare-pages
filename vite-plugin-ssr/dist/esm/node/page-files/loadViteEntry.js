import { assert, assertUsage } from '../../shared/utils/assert';
// import { resolve } from 'path';
import { moduleExists } from '../../shared/utils/moduleExists';
export { loadViteEntry };
async function loadViteEntry({ devPath, prodPath, isProduction, viteDevServer, errorMessage, }) {
    let moduleExports;
    if (isProduction) {
        const prodPathResolved = prodPath;
        assertUsage(moduleExists(prodPathResolved), `${errorMessage}. (Build file ${prodPathResolved} is missing.)`);
        moduleExports = require_(prodPathResolved);
    }
    else {
        assert(viteDevServer);
        const devPathResolved = requireResolve(devPath);
        moduleExports = await viteDevServer.ssrLoadModule(devPathResolved);
    }
    return moduleExports;
}
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
