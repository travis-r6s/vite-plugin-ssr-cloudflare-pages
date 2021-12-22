"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertRouteParams = exports.resolveRouteFunction = void 0;
const utils_1 = require("../utils");
async function resolveRouteFunction(pageRouteFileExports, urlPathname, pageContext, pageRouteFilePath) {
    const hookFilePath = pageRouteFilePath;
    const hookName = 'route()';
    let result;
    try {
        result = pageRouteFileExports.default({ url: urlPathname, pageContext });
    }
    catch (hookError) {
        return { hookError, hookName, hookFilePath };
    }
    (0, utils_1.assertUsage)(!(0, utils_1.isPromise)(result) || pageRouteFileExports.iKnowThePerformanceRisksOfAsyncRouteFunctions, `The Route Function ${pageRouteFilePath} returned a promise. Async Route Functions may significantly slow down your app: every time a page is rendered the Route Functions of *all* your pages are called and awaited for. A slow Route Function will slow down all your pages. If you still want to define an async Route Function then \`export const iKnowThePerformanceRisksOfAsyncRouteFunctions = true\` in \`${pageRouteFilePath}\`.`);
    try {
        result = await result;
    }
    catch (hookError) {
        return { hookError, hookName, hookFilePath };
    }
    if (result === false) {
        return null;
    }
    if (result === true) {
        result = {};
    }
    (0, utils_1.assertUsage)((0, utils_1.isPlainObject)(result), `The Route Function ${pageRouteFilePath} should return a boolean or a plain JavaScript object, instead it returns \`${(0, utils_1.hasProp)(result, 'constructor') ? result.constructor : result}\`.`);
    let precedence = null;
    if ((0, utils_1.hasProp)(result, 'precedence')) {
        precedence = result.precedence;
        (0, utils_1.assertUsage)(typeof precedence === 'number', `The \`precedence\` value returned by the Route Function ${pageRouteFilePath} should be a number.`);
    }
    assertRouteParams(result, `The \`routeParams\` object returned by the Route Function ${pageRouteFilePath} should`);
    const routeParams = result.routeParams || {};
    Object.keys(result).forEach((key) => {
        (0, utils_1.assertUsage)(key === 'match' || key === 'routeParams' || key === 'precedence', `The Route Function ${pageRouteFilePath} returned an object with an unknown key \`{ ${key} }\`. Allowed keys: ['match', 'routeParams', 'precedence'].`);
    });
    (0, utils_1.assert)((0, utils_1.isPlainObject)(routeParams));
    return {
        precedence: null,
        routeParams,
    };
}
exports.resolveRouteFunction = resolveRouteFunction;
function assertRouteParams(result, errPrefix) {
    (0, utils_1.assert)(errPrefix.endsWith(' should'));
    if (!(0, utils_1.hasProp)(result, 'routeParams')) {
        return;
    }
    (0, utils_1.assertUsage)((0, utils_1.isPlainObject)(result.routeParams), `${errPrefix} be a plain JavaScript object.`);
    (0, utils_1.assertUsage)(Object.values(result.routeParams).every((val) => typeof val === 'string'), `${errPrefix} only hold string values.`);
}
exports.assertRouteParams = assertRouteParams;
//# sourceMappingURL=resolveRouteFunction.js.map