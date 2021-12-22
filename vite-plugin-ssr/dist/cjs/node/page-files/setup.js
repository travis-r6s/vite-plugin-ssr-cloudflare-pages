"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const getPageFiles_1 = require("../../shared/getPageFiles");
const assert_1 = require("../../shared/utils/assert");
const ssrEnv_1 = require("../ssrEnv");
const utils_1 = require("../../shared/utils");
const moduleExists_1 = require("../../shared/utils/moduleExists");
const loadViteEntry_1 = require("./loadViteEntry");
(0, getPageFiles_1.setPageFilesAsync)(setPageFiles);
async function setPageFiles() {
    const ssrEnv = (0, ssrEnv_1.getSsrEnv)();
    const viteEntryFile = 'pageFiles.js';
    assertEntry(viteEntryFile);
    const userDist = `${ssrEnv.root}/${ssrEnv.outDir}`;
    // Current directory: vite-plugin-ssr/dist/cjs/node/page-files/
    const pluginDist = `../../../../${ssrEnv.outDir}`;
    const prodPath = `${userDist}/server/${viteEntryFile}`;
    const devPath = `${pluginDist}/esm/node/page-files/${viteEntryFile}`;
    const errorMessage = 'Make sure to run `vite build && vite build --ssr` before running your Node.js server with `createPageRenderer({ isProduction: true })`';
    const moduleExports = await (0, loadViteEntry_1.loadViteEntry)({
        devPath,
        prodPath,
        errorMessage,
        viteDevServer: ssrEnv.viteDevServer,
        isProduction: ssrEnv.isProduction,
    });
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
//# sourceMappingURL=setup.js.map