"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callOnBeforeRouteHook = void 0;
const assertPageContextProvidedByUser_1 = require("../assertPageContextProvidedByUser");
const utils_1 = require("../utils");
const resolveRouteFunction_1 = require("./resolveRouteFunction");
async function callOnBeforeRouteHook(pageContext) {
    if (!pageContext._onBeforeRouteHook) {
        return {};
    }
    const hookFilePath = pageContext._onBeforeRouteHook.filePath;
    const hookName = 'onBeforeRoute';
    let result;
    try {
        result = await pageContext._onBeforeRouteHook.onBeforeRoute(pageContext);
    }
    catch (hookError) {
        return { hookError, hookName, hookFilePath };
    }
    const errPrefix = `The \`onBeforeRoute()\` hook exported by ${pageContext._onBeforeRouteHook.filePath}`;
    (0, utils_1.assertUsage)(result === null ||
        result === undefined ||
        ((0, utils_1.isObjectWithKeys)(result, ['pageContext']) && (0, utils_1.hasProp)(result, 'pageContext')), `${errPrefix} should return \`null\`, \`undefined\`, or a plain JavaScript object \`{ pageContext: { /* ... */ } }\`.`);
    if (result === null || result === undefined) {
        return {};
    }
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(result, 'pageContext', 'object'), `${errPrefix} returned \`{ pageContext }\` but \`pageContext\` should be a plain JavaScript object.`);
    if ((0, utils_1.hasProp)(result.pageContext, '_pageId') && !(0, utils_1.hasProp)(result.pageContext, '_pageId', 'null')) {
        const errPrefix2 = `${errPrefix} returned \`{ pageContext: { _pageId } }\` but \`_pageId\` should be`;
        (0, utils_1.assertUsage)((0, utils_1.hasProp)(result.pageContext, '_pageId', 'string'), `${errPrefix2} a string or \`null\``);
        (0, utils_1.assertUsage)(pageContext._allPageIds.includes(result.pageContext._pageId), `${errPrefix2} one of following values: \`[${pageContext._allPageIds.map((s) => `'${s}'`).join(', ')}]\`.`);
    }
    if ((0, utils_1.hasProp)(result.pageContext, 'routeParams')) {
        (0, resolveRouteFunction_1.assertRouteParams)(result.pageContext, `${errPrefix} returned \`{ pageContext: { routeParams } }\` but \`routeParams\` should`);
    }
    const pageContextProvidedByUser = result.pageContext;
    (0, assertPageContextProvidedByUser_1.assertPageContextProvidedByUser)(pageContextProvidedByUser, { hookFilePath, hookName });
    return { pageContextProvidedByUser };
}
exports.callOnBeforeRouteHook = callOnBeforeRouteHook;
//# sourceMappingURL=callOnBeforeRouteHook.js.map