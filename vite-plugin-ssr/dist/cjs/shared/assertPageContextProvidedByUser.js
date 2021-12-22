"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPageContextProvidedByUser = void 0;
const utils_1 = require("./utils");
function assertPageContextProvidedByUser(pageContextProvidedByUser, hook) {
    const { hookName, hookFilePath } = hook;
    (0, utils_1.assert)(hookFilePath.startsWith('/'));
    const errMessagePrefix = `The hook \`export { ${hookName} }\` of ${hookFilePath} returned`;
    (0, utils_1.assertUsage)((0, utils_1.isObject)(pageContextProvidedByUser), `${errMessagePrefix} \`{ pageContext }\` but \`pageContext\` should be an object.`);
    (0, utils_1.assertUsage)(!isWholePageContext(pageContextProvidedByUser), `${errMessagePrefix} the whole \`pageContext\` object which is forbidden, see https://vite-plugin-ssr.com/pageContext-manipulation#do-not-return-entire-pagecontext`);
}
exports.assertPageContextProvidedByUser = assertPageContextProvidedByUser;
function isWholePageContext(pageContextProvidedByUser) {
    return '_pageId' in pageContextProvidedByUser;
}
//# sourceMappingURL=assertPageContextProvidedByUser.js.map