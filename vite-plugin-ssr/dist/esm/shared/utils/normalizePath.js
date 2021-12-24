import { assert } from './assert';
import { isBrowser } from './isBrowser';
export { normalizePath };
function normalizePath(urlPath) {
    assert(!isBrowser());
    if (!isWindows()) {
        return urlPath;
    }
    const req = require;
    return urlPath.split(req('path').sep).join('/');
}
function isWindows() {
    // `process` is `undefined` in Cloudlfare Pages workers
    if (typeof process === 'undefined') {
        return false;
    }
    return process.platform === 'win32';
}
//# sourceMappingURL=normalizePath.js.map