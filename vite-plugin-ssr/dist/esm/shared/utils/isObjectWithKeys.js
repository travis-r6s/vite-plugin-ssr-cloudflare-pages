import { isPlainObject } from './isPlainObject';
export { isObjectWithKeys };
function isObjectWithKeys(obj, keys) {
    if (!isPlainObject(obj)) {
        return false;
    }
    for (const key of Object.keys(obj)) {
        if (!keys.includes(key)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=isObjectWithKeys.js.map