import { getUrlFull } from '../shared/utils';
const urlFullOriginal = getUrlFull();
let navigationChanged = false;
export const navigationState = {
    markNavigationChange() {
        navigationChanged = true;
    },
    get noNavigationChangeYet() {
        return !navigationChanged && this.isOriginalUrl(getUrlFull());
    },
    isOriginalUrl(url) {
        return url === urlFullOriginal;
    },
};
//# sourceMappingURL=navigationState.js.map