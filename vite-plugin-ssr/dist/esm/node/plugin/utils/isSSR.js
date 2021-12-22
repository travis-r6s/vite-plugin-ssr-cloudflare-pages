import { assert, isObject } from '../../../shared/utils';
export { isSSR_config };
export { isSSR_options };
function isSSR_config(config) {
    return !!config?.build?.ssr;
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