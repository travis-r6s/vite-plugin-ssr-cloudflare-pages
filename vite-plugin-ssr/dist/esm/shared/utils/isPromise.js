import { hasProp } from './hasProp';
import { isCallable } from './isCallable';
export { isPromise };
function isPromise(thing) {
    return hasProp(thing, 'then') && isCallable(thing.then);
}
//# sourceMappingURL=isPromise.js.map