import { assertPageContextProvidedByUser } from './assertPageContextProvidedByUser';
import { assert, assertUsage, hasProp, isCallable } from './utils';
export { getOnBeforeRenderHook };
export { runOnBeforeRenderHooks };
export { assertUsageServerHooksCalled };
function getOnBeforeRenderHook(fileExports, filePath, required) {
    if (required) {
        assertUsage(hasProp(fileExports, 'onBeforeRender'), `${filePath} should \`export { onBeforeRender }\`.`);
    }
    else {
        if (!hasProp(fileExports, 'onBeforeRender')) {
            return null;
        }
    }
    assertUsage(isCallable(fileExports.onBeforeRender), `The \`export { onBeforeRender }\` of ${filePath} should be a function.`);
    const onBeforeRenderHook = {
        async callHook(pageContext) {
            assert(isCallable(fileExports.onBeforeRender));
            const hookReturn = await fileExports.onBeforeRender(pageContext);
            if (hookReturn === undefined || hookReturn === null) {
                return { pageContext: {} };
            }
            assertUsage(hasProp(hookReturn, 'pageContext'), `The \`onBeforeRender()\` hook exported by ${filePath} should return \`undefined\`, \`null\`, or \`{ pageContext: { /*...*/ }}\` (a JavaScript object with a single key \`pageContext\`).`);
            const pageContextProvidedByUser = hookReturn.pageContext;
            assertPageContextProvidedByUser(pageContextProvidedByUser, { hookName: 'onBeforeRender', hookFilePath: filePath });
            return { pageContext: pageContextProvidedByUser };
        },
    };
    return onBeforeRenderHook;
}
async function runOnBeforeRenderHooks(pageFile, defaultFile, pageContext) {
    assert(defaultFile === null || defaultFile.filePath.includes('_default'));
    let pageHookWasCalled = false;
    let skipHook = false;
    const pageContextAddendum = {};
    if (defaultFile?.onBeforeRenderHook && !pageFile?.fileExports.skipOnBeforeRenderDefaultHook) {
        const hookReturn = await defaultFile.onBeforeRenderHook.callHook({
            ...pageContext,
            runOnBeforeRenderPageHook,
            skipOnBeforeRenderPageHook,
        });
        Object.assign(pageContextAddendum, hookReturn.pageContext);
        if (pageFile?.onBeforeRenderHook) {
            assertUsage(pageHookWasCalled || skipHook, [
                `The page \`${pageContext._pageId}\` has a \`onBeforeRender()\` hook defined in ${pageFile.filePath} as well as in ${defaultFile.filePath}.`,
                `Either \`export const skipOnBeforeRenderDefaultHook = true\` in ${pageFile.filePath}, or`,
                'call `pageContext.skipOnBeforeRenderPageHook()` or `pageContext.runOnBeforeRenderPageHook(pageContext)`',
                `in the \`onBeforeRender()\` hook defined in ${defaultFile.filePath} — see https://vite-plugin-ssr.com/onBeforeRender-multiple`,
            ].join(' '));
        }
    }
    else {
        if (pageFile?.onBeforeRenderHook) {
            const hookReturn = await runOnBeforeRenderPageHook(pageContext);
            Object.assign(pageContextAddendum, hookReturn.pageContext);
        }
    }
    assert(!pageFile?.onBeforeRenderHook || pageHookWasCalled || skipHook);
    return pageContextAddendum;
    async function skipOnBeforeRenderPageHook() {
        assertUsage(pageHookWasCalled === false, 'You cannot call `pageContext.skipOnBeforeRenderPageHook()` after having called `pageContext.runOnBeforeRenderPageHook()`.');
        skipHook = true;
    }
    async function runOnBeforeRenderPageHook(pageContextProvided) {
        assertUsage(pageContextProvided, '[pageContext.runOnBeforeRenderPageHook(pageContext)] Missing argument `pageContext`.');
        assertUsage(pageHookWasCalled === false, 'You already called `pageContext.runOnBeforeRenderPageHook()`; you cannot call it a second time.');
        assertUsage(skipHook === false, 'You cannot call `pageContext.runOnBeforeRenderPageHook()` after having called `pageContext.skipOnBeforeRenderPageHook()`.');
        pageHookWasCalled = true;
        if (!pageFile?.onBeforeRenderHook) {
            return { pageContext: {} };
        }
        const hookReturn = await pageFile.onBeforeRenderHook.callHook(pageContextProvided || pageContext);
        return hookReturn;
    }
}
function assertUsageServerHooksCalled(args) {
    const hooksIsomorphic = args.hooksIsomorphic.filter(isFilePath);
    assert(hooksIsomorphic.length > 0);
    const hooksServer = args.hooksServer.filter(isFilePath);
    [...hooksIsomorphic, ...hooksServer].forEach((filePath) => filePath.startsWith('/'));
    if (hooksServer.length > 0) {
        assertUsage(args.serverHooksCalled, [
            `The page \`${args._pageId}\` has \`onBeforeRender()\` hooks defined in \`.page.js\` as well as in \`.page.server.js\` files:`,
            `\`export { onBeforeRender }\` in`,
            hooksIsomorphic[0],
            hooksIsomorphic[1] ? ` and ${hooksIsomorphic[1]}` : null,
            '(`.page.js`)',
            `as well as \`export { onBeforeRender }\` in`,
            hooksServer[0],
            hooksServer[1] ? ` and ${hooksServer[1]}` : null,
            '(`.page.server.js`).',
            'Either call `pageContext.skipOnBeforeRenderServerHooks()`',
            'or call `pageContext.runOnBeforeRenderServerHooks()` in the `onBeforeRender()` hook of',
            hooksIsomorphic[0],
            hooksIsomorphic[1] ? ` or ${hooksIsomorphic[1]}` : null,
            '— see https://vite-plugin-ssr.com/onBeforeRender-multiple',
        ]
            .filter(Boolean)
            .join(' '));
    }
    return;
    function isFilePath(v) {
        if (typeof v === 'string') {
            assert(v.startsWith('/'));
            return true;
        }
        assert(v === undefined || v === null);
        return false;
    }
}
//# sourceMappingURL=onBeforeRenderHook.js.map