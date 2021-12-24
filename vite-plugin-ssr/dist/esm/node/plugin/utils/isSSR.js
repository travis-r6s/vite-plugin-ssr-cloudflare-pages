import { assert, isObject } from '../../../shared/utils';
export { isSSR_config };
export { isSSR_options };
function isSSR_config(config) {
    var _a;
    return !!((_a = config === null || config === void 0 ? void 0 : config.build) === null || _a === void 0 ? void 0 : _a.ssr);
}
// https://github.com/vitejs/vite/discussions/5109#discussioncomment-1450726
function isSSR_options(options) {
    if (options === undefined) {
        return false;
    }
    if (typeof options === 'boolean') {
        return options;
    }
    if (isObject(options)) {
        return !!options.ssr;
    }
    assert(false);
}
//# sourceMappingURL=isSSR.js.map