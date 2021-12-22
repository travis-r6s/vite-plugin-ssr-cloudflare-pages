import { assert, assertUsage, isObject } from './utils';
export { assertPageContextProvidedByUser };
function assertPageContextProvidedByUser(pageContextProvidedByUser, hook) {
    const { hookName, hookFilePath } = hook;
    assert(hookFilePath.startsWith('/'));
    const errMessagePrefix = `The hook \`export { ${hookName} }\` of ${hookFilePath} returned`;
    assertUsage(isObject(pageContextProvidedByUser), `${errMessagePrefix} \`{ pageContext }\` but \`pageContext\` should be an object.`);
    assertUsage(!isWholePageContext(pageContextProvidedByUser), `${errMessagePrefix} the whole \`pageContext\` object which is forbidden, see https://vite-plugin-ssr.com/pageContext-manipulation#do-not-return-entire-pagecontext`);
}
function isWholePageContext(pageContextProvidedByUser) {
    return '_pageId' in pageContextProvidedByUser;
}
//# sourceMappingURL=assertPageContextProvidedByUser.js.map