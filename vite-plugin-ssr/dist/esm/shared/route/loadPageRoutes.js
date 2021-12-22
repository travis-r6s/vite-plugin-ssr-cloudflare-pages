import { findDefaultFiles, findPageFile } from '../getPageFiles';
import { isErrorPage } from './error-page';
import { assert, assertExports, assertUsage, hasProp, objectAssign, slice } from '../utils';
import { getFilesystemRoute } from './resolveFilesystemRoute';
export { loadPageRoutes };
async function loadPageRoutes(globalContext) {
    let onBeforeRouteHook = null;
    const filesystemRoots = [];
    const defaultPageRouteFiles = findDefaultFiles(globalContext._allPageFiles['.page.route']);
    await Promise.all(defaultPageRouteFiles.map(async ({ filePath, loadFile }) => {
        const fileExports = await loadFile();
        assertExportsOfDefaulteRoutePage(fileExports, filePath);
        if ('onBeforeRoute' in fileExports) {
            assertUsage(hasProp(fileExports, 'onBeforeRoute', 'function'), `The \`onBeforeRoute\` export of \`${filePath}\` should be a function.`);
            const { onBeforeRoute } = fileExports;
            onBeforeRouteHook = { filePath, onBeforeRoute };
        }
        if ('filesystemRoutingRoot' in fileExports) {
            assertUsage(hasProp(fileExports, 'filesystemRoutingRoot', 'string'), `The \`filesystemRoutingRoot\` export of \`${filePath}\` should be a string.`);
            assertUsage(hasProp(fileExports, 'filesystemRoutingRoot', 'string'), `The \`filesystemRoutingRoot\` export of \`${filePath}\` is \`'${fileExports.filesystemRoutingRoot}'\` but it should start with a leading slash \`/\`.`);
            filesystemRoots.push({
                rootPath: dirname(filePath),
                rootValue: fileExports.filesystemRoutingRoot,
            });
        }
    }));
    const allPageIds = globalContext._allPageIds;
    const pageRoutes = [];
    await Promise.all(allPageIds
        .filter((pageId) => !isErrorPage(pageId))
        .map(async (pageId) => {
        const filesystemRoute = getFilesystemRoute(pageId, filesystemRoots);
        assert(filesystemRoute.startsWith('/'));
        assert(!filesystemRoute.endsWith('/') || filesystemRoute === '/');
        const pageRoute = {
            pageId,
            filesystemRoute,
        };
        const pageRouteFile = findPageFile(globalContext._allPageFiles['.page.route'], pageId);
        if (pageRouteFile) {
            const { filePath, loadFile } = pageRouteFile;
            const fileExports = await loadFile();
            assertExportsOfRoutePage(fileExports, filePath);
            assertUsage('default' in fileExports, `${filePath} should have a default export.`);
            assertUsage(hasProp(fileExports, 'default', 'string') || hasProp(fileExports, 'default', 'function'), `The default export of ${filePath} should be a string or a function.`);
            assertUsage(!('iKnowThePerformanceRisksOfAsyncRouteFunctions' in fileExports) ||
                hasProp(fileExports, 'iKnowThePerformanceRisksOfAsyncRouteFunctions', 'boolean'), `The export \`iKnowThePerformanceRisksOfAsyncRouteFunctions\` of ${filePath} should be a boolean.`);
            const routeValue = fileExports.default;
            objectAssign(pageRoute, {
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
function assertExportsOfRoutePage(fileExports, filePath) {
    assertExports(fileExports, filePath, ['default', 'iKnowThePerformanceRisksOfAsyncRouteFunctions']);
}
function assertExportsOfDefaulteRoutePage(fileExports, filePath) {
    assertExports(fileExports, filePath, ['onBeforeRoute', 'filesystemRoutingRoot'], {
        ['_onBeforeRoute']: 'onBeforeRoute',
    });
}
function dirname(filePath) {
    assert(filePath.startsWith('/'));
    assert(!filePath.endsWith('/'));
    const paths = filePath.split('/');
    const dirPath = slice(paths, 0, -1).join('/') || '/';
    assert(dirPath.startsWith('/'));
    assert(!dirPath.endsWith('/') || dirPath === '/');
    return dirPath;
}
//# sourceMappingURL=loadPageRoutes.js.map