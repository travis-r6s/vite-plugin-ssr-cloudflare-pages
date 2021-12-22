"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObjectWithKeys = void 0;
const isPlainObject_1 = require("./isPlainObject");
function isObjectWithKeys(obj, keys) {
    if (!(0, isPlainObject_1.isPlainObject)(obj)) {
        return false;
    }
    for (const key of Object.keys(obj)) {
        if (!keys.includes(key)) {
            return false;
        }
    }
    return true;
}
exports.isObjectWithKeys = isObjectWithKeys;
//# sourceMappingURL=isObjectWithKeys.js.map