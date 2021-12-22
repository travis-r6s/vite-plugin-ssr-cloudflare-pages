import { navigationState } from '../navigationState';
import { assert, assertUsage, assertWarning, getFileUrl, hasProp, isPlainObject, isObject, objectAssign, getPluginError, } from '../../shared/utils';
import { parse } from '@brillout/json-s';
import { getPageContextSerializedInHtml } from '../getPageContextSerializedInHtml';
import { findDefaultFile, findPageFile } from '../../shared/getPageFiles';
import { getErrorPageId, route } from '../../shared/route';
import { assertUsageServerHooksCalled, runOnBeforeRenderHooks } from '../../shared/onBeforeRenderHook';
import { loadPageFiles } from '../loadPageFiles';
import { releasePageContextInterim } from '../releasePageContext';
export { getPageContext };
async function getPageContext(pageContext) {
    if (pageContext._isFirstRender && navigationState.isOriginalUrl(pageContext.url)) {
        const pageContextAddendum = await loadPageContextSerializedInHtml();
        return pageContextAddendum;
    }
    const pageContextFromRoute = await getPageContextFromRoute(pageContext);
    const pageContextAddendum = await loadPageContextAfterRoute(pageContext, pageContextFromRoute);
    return pageContextAddendum;
}
async function loadPageContextSerializedInHtml() {
    const pageContextAddendum = getPageContextSerializedInHtml();
    deleteRedundantPageContext(pageContextAddendum);
    const pageFiles = await loadPageFiles({ _pageId: pageContextAddendum._pageId });
    objectAssign(pageContextAddendum, pageFiles);
    objectAssign(pageContextAddendum, {
        isHydration: true,
        _comesDirectlyFromServer: true,
    });
    return pageContextAddendum;
}
async function loadPageContextAfterRoute(pageContext, pageContextFromRoute) {
    const pageContextAddendum = {
        isHydration: false,
    };
    objectAssign(pageContextAddendum, pageContextFromRoute);
    const pageFiles = await loadPageFiles({ _pageId: pageContextFromRoute._pageId });
    objectAssign(pageContextAddendum, pageFiles);
    let pageContextOnBeforeRenderHooks;
    try {
        pageContextOnBeforeRenderHooks = await executeOnBeforeRenderHooks({
            ...pageContext,
            ...pageContextFromRoute,
            ...pageContextAddendum,
        });
    }
    catch (err) {
        const pageContextFromRoute = handleError(pageContext, err);
        const pageContextAddendum = await loadPageContextAfterRoute(pageContext, pageContextFromRoute);
        return pageContextAddendum;
    }
    assert(pageContextOnBeforeRenderHooks._pageContextRetrievedFromServer === null ||
        isObject(pageContextOnBeforeRenderHooks._pageContextRetrievedFromServer));
    assert([true, false].includes(pageContextOnBeforeRenderHooks._comesDirectlyFromServer));
    objectAssign(pageContextAddendum, pageContextOnBeforeRenderHooks);
    return pageContextAddendum;
}
async function getPageContextFromRoute(pageContext) {
    const routeResult = await route(pageContext);
    if ('hookError' in routeResult) {
        const pageContextFromRoute = handleError(pageContext, routeResult.hookError);
        return pageContextFromRoute;
    }
    const pageContextFromRoute = routeResult.pageContextAddendum;
    if (pageContextFromRoute._pageId === null) {
        setTimeout(() => {
            handle404(pageContext);
        }, 0);
        assertUsage(false, `[404] Page ${pageContext.url} does not exist. (\`vite-plugin-ssr\` will now server-side route to \`${pageContext.url}\`.)`);
    }
    else {
        assert(hasProp(pageContextFromRoute, '_pageId', 'string'));
    }
    return pageContextFromRoute;
}
function handle404(pageContext) {
    // We let the server show the 404 page; the server will show the 404 URL against the list of routes.
    window.location.pathname = pageContext.url;
}
async function retrievePageContext(pageContext) {
    const pageContextUrl = getFileUrl(pageContext.url, '.pageContext.json', true);
    const response = await fetch(pageContextUrl);
    // Static hosts return a 404
    assert(response.status !== 404);
    {
        const contentType = response.headers.get('content-type');
        assertUsage(contentType && contentType.includes('application/json'), `Wrong HTTP Response Header \`content-type\` value for URL ${pageContextUrl} (it should be \`application/json\` but we got \`${contentType}\`). Make sure to use \`pageContext.httpResponse.contentType\`, see https://github.com/brillout/vite-plugin-ssr/issues/191`);
    }
    const responseText = await response.text();
    const responseObject = parse(responseText);
    assert(!('pageContext404PageDoesNotExist' in responseObject));
    if ('serverSideError' in responseObject) {
        throw getPluginError('`pageContext` could not be fetched from the server as an error occurred on the server; check your server logs.');
    }
    assert(hasProp(responseObject, 'pageContext'));
    const pageContextFromServer = responseObject.pageContext;
    assert(isPlainObject(pageContextFromServer));
    assert(hasProp(pageContextFromServer, '_pageId', 'string'));
    deleteRedundantPageContext(pageContextFromServer);
    return pageContextFromServer;
}
function getOnBeforeRenderServerHookFiles(pageContext) {
    const hooksServer = [];
    const serverFiles = pageContext._serverFiles;
    const pageId = pageContext._pageId;
    const serverFileDefault = findDefaultFile(serverFiles, pageId);
    if (serverFileDefault?.fileExports.hasExportOnBeforeRender) {
        hooksServer.push(serverFileDefault.filePath);
    }
    const serverFilePage = findPageFile(serverFiles, pageId);
    if (serverFilePage?.fileExports.hasExportOnBeforeRender) {
        hooksServer.push(serverFilePage.filePath);
    }
    return hooksServer;
}
const ALREADY_SET_BY_CLIENT_ROUTER = ['urlPathname', 'urlParsed'];
const ALREADY_SET_BY_CLIENT = ['Page', 'pageExports'];
function deleteRedundantPageContext(pageContext) {
    const alreadySet = [...ALREADY_SET_BY_CLIENT, ...ALREADY_SET_BY_CLIENT_ROUTER];
    alreadySet.forEach((prop) => {
        if (prop in pageContext) {
            // We need to cast `ALREADY_SET_BY_CLIENT` to `string[]`
            //  - https://stackoverflow.com/questions/56565528/typescript-const-assertions-how-to-use-array-prototype-includes
            //  - https://stackoverflow.com/questions/57646355/check-if-string-is-included-in-readonlyarray-in-typescript
            if (ALREADY_SET_BY_CLIENT_ROUTER.includes(prop)) {
                assert(prop.startsWith('url'));
                assertWarning(false, `\`pageContext.${prop}\` is already available in the browser when using \`useClientRouter()\`; including \`${prop}\` in \`passToClient\` has no effect.`);
            }
            else {
                assertWarning(false, `\`pageContext.${prop}\` is a built-in that cannot be overriden; including \`${prop}\` in \`passToClient\` has no effect.`);
            }
            delete pageContext[prop];
        }
    });
}
async function executeOnBeforeRenderHooks(pageContext) {
    let serverHooksCalled = false;
    let skipServerHooks = false;
    const pageContextOnBeforeRenderHooks = {};
    objectAssign(pageContextOnBeforeRenderHooks, { _pageContextRetrievedFromServer: null });
    if (isomorphicHooksExist()) {
        const pageContextFromIsomorphic = await runOnBeforeRenderHooks(pageContext._pageIsomorphicFile, pageContext._pageIsomorphicFileDefault, {
            ...pageContext,
            skipOnBeforeRenderServerHooks,
            runOnBeforeRenderServerHooks: () => runOnBeforeRenderServerHooks(false),
        });
        assertUsageServerHooksCalled({
            hooksServer: getOnBeforeRenderServerHookFiles(pageContext),
            hooksIsomorphic: [
                pageContext._pageIsomorphicFile?.onBeforeRenderHook && pageContext._pageIsomorphicFile.filePath,
                pageContext._pageIsomorphicFileDefault?.onBeforeRenderHook && pageContext._pageIsomorphicFileDefault.filePath,
            ],
            serverHooksCalled,
            _pageId: pageContext._pageId,
        });
        objectAssign(pageContextOnBeforeRenderHooks, pageContextFromIsomorphic);
        objectAssign(pageContextOnBeforeRenderHooks, { _comesDirectlyFromServer: false });
        return pageContextOnBeforeRenderHooks;
    }
    else if (!serverHooksExists()) {
        objectAssign(pageContextOnBeforeRenderHooks, { _comesDirectlyFromServer: false });
        return pageContextOnBeforeRenderHooks;
    }
    else {
        const result = await runOnBeforeRenderServerHooks(true);
        assert(serverHooksCalled);
        objectAssign(pageContextOnBeforeRenderHooks, result.pageContext);
        objectAssign(pageContextOnBeforeRenderHooks, { _comesDirectlyFromServer: true });
        return pageContextOnBeforeRenderHooks;
    }
    function isomorphicHooksExist() {
        return (!!pageContext._pageIsomorphicFile?.onBeforeRenderHook ||
            !!pageContext._pageIsomorphicFileDefault?.onBeforeRenderHook);
    }
    function serverHooksExists() {
        return getOnBeforeRenderServerHookFiles({ ...pageContext, ...pageContextOnBeforeRenderHooks }).length > 0;
    }
    async function skipOnBeforeRenderServerHooks() {
        assertUsage(serverHooksCalled === false, 'You cannot call `pageContext.skipOnBeforeRenderServerHooks()` after having called `pageContext.runOnBeforeRenderServerHooks()`.');
        skipServerHooks = true;
    }
    async function runOnBeforeRenderServerHooks(doNotPrepareForRelease) {
        assertUsage(skipServerHooks === false, 'You cannot call `pageContext.runOnBeforeRenderServerHooks()` after having called `pageContext.skipOnBeforeRenderServerHooks()`.');
        assertUsage(serverHooksCalled === false, 'You already called `pageContext.runOnBeforeRenderServerHooks()`; you cannot call it a second time.');
        serverHooksCalled = true;
        const pageContextFromServer = await retrievePageContext(pageContext);
        objectAssign(pageContextOnBeforeRenderHooks, { _pageContextRetrievedFromServer: pageContextFromServer });
        let pageContextReadyForRelease = !doNotPrepareForRelease
            ? releasePageContextInterim(pageContextFromServer, pageContextOnBeforeRenderHooks)
            : pageContextFromServer;
        return { pageContext: pageContextReadyForRelease };
    }
}
function handleError(pageContext, err) {
    const errorPageId = getErrorPageId(pageContext._allPageIds);
    if (!errorPageId) {
        throw err;
    }
    else {
        console.error(err);
    }
    const pageContextFromRoute = {
        _pageId: errorPageId,
        is404: false,
        routeParams: {},
    };
    return pageContextFromRoute;
}
//# sourceMappingURL=getPageContext.js.map