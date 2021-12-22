"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPageRoutes = void 0;
const getPageFiles_1 = require("../getPageFiles");
const error_page_1 = require("./error-page");
const utils_1 = require("../utils");
const resolveFilesystemRoute_1 = require("./resolveFilesystemRoute");
async function loadPageRoutes(globalContext) {
    let onBeforeRouteHook = null;
    const filesystemRoots = [];
    const defaultPageRouteFiles = (0, getPageFiles_1.findDefaultFiles)(globalContext._allPageFiles['.page.route']);
    await Promise.all(defaultPageRouteFiles.map(async ({ filePath, loadFile }) => {
        const fileExports = await loadFile();
        assertExportsOfDefaulteRoutePage(fileExports, filePath);
        if ('onBeforeRoute' in fileExports) {
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'onBeforeRoute', 'function'), `The \`onBeforeRoute\` export of \`${filePath}\` should be a function.`);
            const { onBeforeRoute } = fileExports;
            onBeforeRouteHook = { filePath, onBeforeRoute };
        }
        if ('filesystemRoutingRoot' in fileExports) {
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'filesystemRoutingRoot', 'string'), `The \`filesystemRoutingRoot\` export of \`${filePath}\` should be a string.`);
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'filesystemRoutingRoot', 'string'), `The \`filesystemRoutingRoot\` export of \`${filePath}\` is \`'${fileExports.filesystemRoutingRoot}'\` but it should start with a leading slash \`/\`.`);
            filesystemRoots.push({
                rootPath: dirname(filePath),
                rootValue: fileExports.filesystemRoutingRoot,
            });
        }
    }));
    const allPageIds = globalContext._allPageIds;
    const pageRoutes = [];
    await Promise.all(allPageIds
        .filter((pageId) => !(0, error_page_1.isErrorPage)(pageId))
        .map(async (pageId) => {
        const filesystemRoute = (0, resolveFilesystemRoute_1.getFilesystemRoute)(pageId, filesystemRoots);
        (0, utils_1.assert)(filesystemRoute.startsWith('/'));
        (0, utils_1.assert)(!filesystemRoute.endsWith('/') || filesystemRoute === '/');
        const pageRoute = {
            pageId,
            filesystemRoute,
        };
        const pageRouteFile = (0, getPageFiles_1.findPageFile)(globalContext._allPageFiles['.page.route'], pageId);
        if (pageRouteFile) {
            const { filePath, loadFile } = pageRouteFile;
            const fileExports = await loadFile();
            assertExportsOfRoutePage(fileExports, filePath);
            (0, utils_1.assertUsage)('default' in fileExports, `${filePath} should have a default export.`);
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'default', 'string') || (0, utils_1.hasProp)(fileExports, 'default', 'function'), `The default export of ${filePath} should be a string or a function.`);
            (0, utils_1.assertUsage)(!('iKnowThePerformanceRisksOfAsyncRouteFunctions' in fileExports) ||
                (0, utils_1.hasProp)(fileExports, 'iKnowThePerformanceRisksOfAsyncRouteFunctions', 'boolean'), `The export \`iKnowThePerformanceRisksOfAsyncRouteFunctions\` of ${filePath} should be a boolean.`);
            const routeValue = fileExports.default;
            (0, utils_1.objectAssign)(pageRoute, {
                pageRouteFile: { filePath, fileExports, routeValue },
            });
            pageRoutes.push(pageRoute);
        }
        else {
            pageRoutes.push(pageRoute);
        }
    }));
    return { pageRoutes, onBeforeRouteHook };
}
exports.loadPageRoutes = loadPageRoutes;
function assertExportsOfRoutePage(fileExports, filePath) {
    (0, utils_1.assertExports)(fileExports, filePath, ['default', 'iKnowThePerformanceRisksOfAsyncRouteFunctions']);
}
function assertExportsOfDefaulteRoutePage(fileExports, filePath) {
    (0, utils_1.assertExports)(fileExports, filePath, ['onBeforeRoute', 'filesystemRoutingRoot'], {
        ['_onBeforeRoute']: 'onBeforeRoute',
    });
}
function dirname(filePath) {
    (0, utils_1.assert)(filePath.startsWith('/'));
    (0, utils_1.assert)(!filePath.endsWith('/'));
    const paths = filePath.split('/');
    const dirPath = (0, utils_1.slice)(paths, 0, -1).join('/') || '/';
    (0, utils_1.assert)(dirPath.startsWith('/'));
    (0, utils_1.assert)(!dirPath.endsWith('/') || dirPath === '/');
    return dirPath;
}
//# sourceMappingURL=loadPageRoutes.js.map