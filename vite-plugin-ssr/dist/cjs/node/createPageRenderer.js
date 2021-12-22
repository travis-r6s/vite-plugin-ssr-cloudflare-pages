"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPageRendererWasCalled = exports.createPageRenderer = void 0;
const ssrEnv_1 = require("./ssrEnv");
const renderPage_1 = require("./renderPage");
const utils_1 = require("../shared/utils");
const assert_1 = require("../shared/utils/assert");
const path_1 = require("path");
const importBuild_1 = require("./importBuild");
let wasCalled = false;
function createPageRendererWasCalled() {
    return wasCalled;
}
exports.createPageRendererWasCalled = createPageRendererWasCalled;
function createPageRenderer({ viteDevServer, root, outDir = 'dist', isProduction, base = '/', }) {
    (0, assert_1.assertUsage)(!wasCalled, 'You are trying to call `createPageRenderer()` a second time, but it should be called only once.');
    wasCalled = true;
    const ssrEnv = { viteDevServer, root, outDir, isProduction, baseUrl: base };
    assertArguments(ssrEnv, Array.from(arguments));
    (0, ssrEnv_1.setSsrEnv)(ssrEnv);
    return renderPage_1.renderPageWithoutThrowing;
}
exports.createPageRenderer = createPageRenderer;
function assertArguments(ssrEnv, args) {
    const { viteDevServer, root, outDir, isProduction, baseUrl } = ssrEnv;
    (0, assert_1.assertUsage)(root === undefined || typeof root === 'string', '`createPageRenderer({ root })`: argument `root` should be a string.');
    (0, assert_1.assertUsage)(typeof outDir === 'string', '`createPageRenderer({ outDir })`: argument `outDir` should be a string.');
    (0, assert_1.assertUsage)(typeof baseUrl === 'string', '`createPageRenderer({ base })`: argument `base` should be a string or `undefined`.');
    (0, utils_1.assertUsageBaseUrl)(baseUrl, '`createPageRenderer({ base })`: ');
    (0, assert_1.assertUsage)(isProduction === true || isProduction === false || isProduction === undefined, '`createPageRenderer({ isProduction })`: argument `isProduction` should be `true`, `false`, or `undefined`.');
    if ((0, importBuild_1.importBuildWasCalled)()) {
        (0, assert_1.assertUsage)(isProduction, '`createPageRenderer({ isProduction })`: argument `isProduction` should be `true` if `dist/server/importBuild.js` is loaded. (You should load `dist/server/importBuild.js` only in production.)');
        (0, assert_1.assertUsage)(root === undefined, '`createPageRenderer({ root })`: argument `root` has no effect if `dist/server/importBuild.js` is loaded. Remove the `root` argument.');
    }
    if (isProduction === true) {
        (0, assert_1.assertUsage)(viteDevServer === undefined, '`createPageRenderer({ viteDevServer, isProduction })`: if `isProduction` is `true`, then `viteDevServer` should be `undefined`.');
        (0, assert_1.assertUsage)(root || (0, importBuild_1.importBuildWasCalled)(), "`createPageRenderer({ root })`: argument `root` is missing. (Alternatively, if `root` doesn't exist because you are bundling your server code into a single file, then load `dist/server/importBuild.js`.)");
    }
    else {
        (0, assert_1.assertUsage)(root, '`createPageRenderer({ root })`: argument `root` is missing.');
        (0, assert_1.assertUsage)(!!viteDevServer, '`createPageRenderer({ viteDevServer, isProduction })`: if `isProduction` is not `true`, then `viteDevServer` cannot be `undefined`.');
        const wrongViteDevServerValueError = '`createPageRenderer({ viteDevServer, isProduction })`: if `isProduction` is not `true`, then `viteDevServer` should be `viteDevServer = await vite.createServer(/*...*/)`.';
        (0, assert_1.assertUsage)((0, utils_1.hasProp)(viteDevServer, 'config') &&
            (0, utils_1.hasProp)(viteDevServer.config, 'root') &&
            typeof viteDevServer.config.root === 'string', wrongViteDevServerValueError);
        {
            const rootVite = (0, path_1.resolve)(viteDevServer.config.root);
            const rootResolved = (0, path_1.resolve)(root);
            (0, assert_1.assertUsage)(rootVite === rootResolved, '`createPageRenderer({ viteDevServer, root })`: wrong `root` value, make sure it matches `viteDevServer.config.root`. ' +
                `The \`root\` you provided resolves to \`'${rootResolved}'\` while \`viteDevServer.config.root\` resolves to \`${rootVite}\`.`);
        }
        (0, assert_1.assertUsage)((0, utils_1.hasProp)(viteDevServer, 'config', 'object') && (0, utils_1.hasProp)(viteDevServer.config, 'plugins', 'array'), wrongViteDevServerValueError);
        (0, assert_1.assertUsage)(viteDevServer.config.plugins.find((plugin) => plugin.name.startsWith('vite-plugin-ssr')), "`vite-pugin-ssr`'s Vite plugin is not installed. Make sure to add it to your `vite.config.js`.");
    }
    (0, assert_1.assertUsage)(args.length === 1, '`createPageRenderer()`: all arguments should be passed as a single argument object.');
    (0, assert_1.assert)(typeof args[0] === 'object' && args[0] !== null);
    Object.keys(args[0]).forEach((argName) => {
        (0, assert_1.assertUsage)(['viteDevServer', 'root', 'outDir', 'isProduction', 'base'].includes(argName), '`createPageRenderer()`: Unknown argument `' + argName + '`.');
    });
}
//# sourceMappingURL=createPageRenderer.js.map