import { assertBaseUrl } from '../shared/utils';
export { setSsrEnv };
export { getSsrEnv };
function getSsrEnv() {
    const ssrEnv = global.__vite_ssr_plugin;
    assertBaseUrl(ssrEnv.baseUrl);
    return ssrEnv;
}
function setSsrEnv(ssrEnv) {
    assertBaseUrl(ssrEnv.baseUrl);
    global.__vite_ssr_plugin = ssrEnv;
}
//# sourceMappingURL=ssrEnv.js.map