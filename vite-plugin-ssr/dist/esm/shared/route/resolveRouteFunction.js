import { assert, assertUsage, hasProp, isPlainObject, isPromise } from '../utils';
export { resolveRouteFunction };
export { assertRouteParams };
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
    assertUsage(!isPromise(result) || pageRouteFileExports.iKnowThePerformanceRisksOfAsyncRouteFunctions, `The Route Function ${pageRouteFilePath} returned a promise. Async Route Functions may significantly slow down your app: every time a page is rendered the Route Functions of *all* your pages are called and awaited for. A slow Route Function will slow down all your pages. If you still want to define an async Route Function then \`export const iKnowThePerformanceRisksOfAsyncRouteFunctions = true\` in \`${pageRouteFilePath}\`.`);
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
    assertUsage(isPlainObject(result), `The Route Function ${pageRouteFilePath} should return a boolean or a plain JavaScript object, instead it returns \`${hasProp(result, 'constructor') ? result.constructor : result}\`.`);
    let precedence = null;
    if (hasProp(result, 'precedence')) {
        precedence = result.precedence;
        assertUsage(typeof precedence === 'number', `The \`precedence\` value returned by the Route Function ${pageRouteFilePath} should be a number.`);
    }
    assertRouteParams(result, `The \`routeParams\` object returned by the Route Function ${pageRouteFilePath} should`);
    const routeParams = result.routeParams || {};
    Object.keys(result).forEach((key) => {
        assertUsage(key === 'match' || key === 'routeParams' || key === 'precedence', `The Route Function ${pageRouteFilePath} returned an object with an unknown key \`{ ${key} }\`. Allowed keys: ['match', 'routeParams', 'precedence'].`);
    });
    assert(isPlainObject(routeParams));
    return {
        precedence: null,
        routeParams,
    };
}
function assertRouteParams(result, errPrefix) {
    assert(errPrefix.endsWith(' should'));
    if (!hasProp(result, 'routeParams')) {
        return;
    }
    assertUsage(isPlainObject(result.routeParams), `${errPrefix} be a plain JavaScript object.`);
    assertUsage(Object.values(result.routeParams).every((val) => typeof val === 'string'), `${errPrefix} only hold string values.`);
}
//# sourceMappingURL=resolveRouteFunction.js.map