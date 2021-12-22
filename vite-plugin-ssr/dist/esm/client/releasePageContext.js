import { assert, assertUsage, isObject } from '../shared/utils';
import { sortPageContext } from '../shared/sortPageContext';
// Release `pageContext` for user consumption. This is mostly about adding `assertPassToClient()`.
export { releasePageContext };
export { releasePageContextInterim };
// Release `pageContext` for user consumption, with Vue support (when `pageContext` is made reactive with Vue).
// For Vue + Cient Routing, the `pageContext` needs to be made reactive:
// ```js
// import { reactive } from 'vue'
// // See entire example at `/examples/vue-full/`
// const pageContextReactive = reactive(pageContext)
// ```
function releasePageContext(pageContext) {
    assert('Page' in pageContext);
    assert(isObject(pageContext.pageExports));
    assert([true, false].includes(pageContext.isHydration));
    // For Vue's reactivity
    resolveGetters(pageContext);
    // For prettier `console.log(pageContext)`
    sortPageContext(pageContext);
    assert([true, false].includes(pageContext._comesDirectlyFromServer));
    const pageContextReadyForRelease = !pageContext._comesDirectlyFromServer
        ? // Not possible to achieve `getAssertPassToClientProxy()` if some `onBeforeRender()` hook defined in `.page.js` was called. (We cannot infer what `pageContext` properties came from the server-side or from the client-side. Which is fine because the user will likely dig into why the property is missing in `const pageContext = await runOnBeforeRenderServerHooks()` anyways, which does support throwing the helpul `assertPassToClient()` error message.)
            pageContext
        : getAssertPassToClientProxyWithVueSupport(pageContext);
    return pageContextReadyForRelease;
}
// Release `pageContext` for user consumption, when `const pageContext = await runOnBeforeRenderServerHooks()`.
// A priori, there is no need to be able to make `pageContext` Vue reactive here.
function releasePageContextInterim(pageContext, pageContextRetrievedFromServer) {
    // For prettier `console.log(pageContext)`
    sortPageContext(pageContext);
    const pageContextReadyForRelease = getAssertPassToClientProxy(pageContext, pageContextRetrievedFromServer);
    return pageContextReadyForRelease;
}
const JAVASCRIPT_BUILT_INS = [
    'then',
    'toJSON', // Vue tries to access `toJSON`
];
const PASS_TO_CLIENT_BUILT_INS = ['_pageId', '_serverSideErrorWhileStreaming'];
// Without Vue hanlding
function getAssertPassToClientProxy(pageContext, pageContextRetrievedFromServer) {
    return new Proxy(pageContext, { get });
    function get(_, prop) {
        assertPassToClient(pageContextRetrievedFromServer, prop, isMissing(prop));
        return pageContext[prop];
    }
    function isMissing(prop) {
        if (prop in pageContext)
            return false;
        if (JAVASCRIPT_BUILT_INS.includes(prop))
            return false;
        return true;
    }
}
// With Vue hanlding
let disable = false;
function getAssertPassToClientProxyWithVueSupport(pageContext) {
    return new Proxy(pageContext, { get });
    function isMissing(prop) {
        if (prop in pageContext)
            return false;
        if (JAVASCRIPT_BUILT_INS.includes(prop))
            return false;
        if (typeof prop === 'symbol')
            return false; // Vue tries to access some symbols
        if (typeof prop !== 'string')
            return false;
        if (prop.startsWith('__v_'))
            return false; // Vue internals upon `reactive(pageContext)`
        return true;
    }
    function get(_, prop) {
        if (disable !== false && disable !== prop) {
            assertPassToClient(pageContext._pageContextRetrievedFromServer, prop, isMissing(prop));
        }
        // We disable `assertPassToClient` for the next attempt to read `prop`, because of how Vue's reactivity work.
        // (When changing a reactive object, Vue tries to read it's old value first. This triggers a `assertPassToClient()` failure if e.g. `pageContextOldReactive.routeParams = pageContextNew.routeParams` and `pageContextOldReactive` has no `routeParams`.)
        disable = prop;
        window.setTimeout(() => {
            disable = false;
        }, 0);
        return pageContext[prop];
    }
}
function assertPassToClient(pageContextRetrievedFromServer, prop, isMissing) {
    if (!isMissing) {
        return;
    }
    if (pageContextRetrievedFromServer === null) {
        // We cannot determine `passToClientInferred` if we didn't receive any `pageContext` from the server
        return;
    }
    const passToClientInferred = Object.keys(pageContextRetrievedFromServer).filter((prop) => !PASS_TO_CLIENT_BUILT_INS.includes(prop));
    assertUsage(false, [
        `\`pageContext.${prop}\` is not available in the browser.`,
        `Make sure that \`passToClient.includes('${prop}')\`.`,
        `(Currently \`passToClient\` is \`[${passToClientInferred.map((prop) => `'${prop}'`).join(', ')}]\`.)`,
        'More infos at https://vite-plugin-ssr.com/passToClient',
    ].join(' '));
}
// Remove propery descriptor getters because they break Vue's reactivity.
// E.g. resolve the `pageContext.urlPathname` getter.
function resolveGetters(pageContext) {
    Object.entries(pageContext).forEach(([key, val]) => {
        delete pageContext[key];
        pageContext[key] = val;
    });
}
//# sourceMappingURL=releasePageContext.js.map