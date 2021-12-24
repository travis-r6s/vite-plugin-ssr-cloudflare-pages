"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../../shared/utils/assert");
const moduleExists_1 = require("../../shared/utils/moduleExists");
const path_1 = require("path");
const getPageFiles_1 = require("../../shared/getPageFiles");
const ssrEnv_1 = require("../ssrEnv");
const utils_1 = require("../../shared/utils");
(0, getPageFiles_1.setPageFilesAsync)(setPageFiles);
async function setPageFiles() {
    const ssrEnv = (0, ssrEnv_1.getSsrEnv)();
    (0, assert_1.assertUsage)(isNodejs(), ssrEnv.isProduction
        ? "You are running your `vite-plugin-ssr` app in a production environement that doesn't seem to be Node.js. You may need to load `importBuild.js`, see https://vite-plugin-ssr.com/importBuild.js"
        : "You are trying to develop your `vite-plugin-ssr` app in an environement that doesn't seem to be Node.js. Is your dev setup using Node.js? Note that, for development, `vite-plugin-ssr` only supports Node.js. Contact the `vite-plugin-ssr` maintainers if you need to dev in another environement than Node.js.");
    const viteEntryFile = 'pageFiles.js';
    assertEntry(viteEntryFile);
    const userDist = `${ssrEnv.root}/${ssrEnv.outDir}`;
    // Current directory: vite-plugin-ssr/dist/cjs/node/page-files/
    const pluginDist = `../../../../dist`;
    const viteEntryPathProd = `${userDist}/server/${viteEntryFile}`;
    const viteEntryPathDev = `${pluginDist}/esm/node/page-files/${viteEntryFile}`;
    let moduleExports;
    if (ssrEnv.isProduction) {
        const prodPathResolved = (0, path_1.resolve)(viteEntryPathProd);
        (0, assert_1.assertUsage)((0, moduleExists_1.moduleExists)(prodPathResolved), 'Make sure to run `vite build && vite build --ssr` before running your Node.js server with `createPageRenderer({ isProduction: true })`' +
            `. (Build file ${prodPathResolved} is missing.)`);
        moduleExports = require_(prodPathResolved);
    }
    else {
        (0, assert_1.assert)(ssrEnv.viteDevServer);
        const devPathResolved = requireResolve(viteEntryPathDev);
        moduleExports = await ssrEnv.viteDevServer.ssrLoadModule(devPathResolved);
    }
    const pageFiles = moduleExports.pageFiles || moduleExports.default.pageFiles;
    (0, assert_1.assert)(pageFiles);
    (0, assert_1.assert)((0, utils_1.hasProp)(pageFiles, '.page'));
    return pageFiles;
}
function assertEntry(viteEntryFile) {
    let dir;
    let viteEntryPath;
    let viteEntryResolved;
    let requireTypeof;
    let requireConstructor;
    let requireResolveTypeof;
    let requireResolveConstructor;
    try {
        dir = __dirname;
        (0, assert_1.assert)(dir);
        (0, assert_1.assert)((0, path_1.isAbsolute)(dir));
        viteEntryPath = (0, path_1.resolve)(dir, viteEntryFile);
        (0, assert_1.assert)((0, path_1.isAbsolute)(viteEntryPath));
        requireTypeof = typeof require;
        requireConstructor = String(require.constructor);
        requireResolveTypeof = typeof require.resolve;
        requireResolveConstructor = String(require.resolve.constructor);
        const req = require;
        const res = req.resolve;
        viteEntryResolved = res(viteEntryPath);
        (0, assert_1.assert)(viteEntryResolved);
        (0, assert_1.assert)((0, path_1.isAbsolute)(viteEntryResolved));
        (0, assert_1.assert)((0, moduleExists_1.moduleExists)(`./${viteEntryFile}`, dir));
    }
    catch (err) {
        throw new Error(`You stumbled upon a known bug. Please reach out at ${utils_1.projectInfo.githubRepository}/issues/new or ${utils_1.projectInfo.discordInvite} and include this message. Debug info (vite-plugin-ssr maintainer will use this to fix the bug): ${JSON.stringify({
            dir,
            viteEntryFile,
            viteEntryPath,
            viteEntryResolved,
            requireTypeof,
            requireConstructor,
            requireResolveTypeof,
            requireResolveConstructor,
        })}`);
    }
}
// `req` instead of `require` so that Webpack doesn't do dynamic dependency analysis
const req = require;
function require_(modulePath) {
    const req = require;
    return req(modulePath);
}
function requireResolve(modulePath) {
    return req.resolve(modulePath);
}
function isNodejs() {
    try {
        return __filename === require.resolve(__filename);
    }
    catch (_) {
        return false;
    }
}
//# sourceMappingURL=setup.js.map