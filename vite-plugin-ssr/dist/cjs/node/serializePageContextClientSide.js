"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIs404ToPageProps = exports.serializePageContextClientSide = void 0;
const json_s_1 = require("@brillout/json-s");
const route_1 = require("../shared/route");
const utils_1 = require("../shared/utils");
function serializePageContextClientSide(pageContext) {
    const pageContextClient = { _pageId: pageContext._pageId };
    let passToClient = [...pageContext._passToClient];
    if ((0, route_1.isErrorPage)(pageContext._pageId)) {
        (0, utils_1.assert)((0, utils_1.hasProp)(pageContext, 'is404', 'boolean'));
        addIs404ToPageProps(pageContext);
        passToClient.push(...['pageProps', 'is404']);
    }
    passToClient = (0, utils_1.unique)(passToClient);
    passToClient.forEach((prop) => {
        pageContextClient[prop] = pageContext[prop];
    });
    if ((0, utils_1.hasProp)(pageContext, '_serverSideErrorWhileStreaming')) {
        (0, utils_1.assert)(pageContext._serverSideErrorWhileStreaming === true);
        pageContextClient['_serverSideErrorWhileStreaming'] = true;
    }
    (0, utils_1.assert)((0, utils_1.isPlainObject)(pageContextClient));
    let pageContextSerialized;
    const serialize = json_s_1.stringify;
    const serializerName = '@brillout/json-s';
    const serializerRepo = 'https://github.com/brillout/json-s';
    const pageContextClientWrapper = { pageContext: pageContextClient };
    try {
        pageContextSerialized = serialize(pageContextClientWrapper);
    }
    catch (err) {
        passToClient.forEach((prop) => {
            try {
                serialize(pageContext[prop]);
            }
            catch (err) {
                console.error(err);
                (0, utils_1.assertUsage)(false, `\`pageContext['${prop}']\` can not be serialized, and it therefore cannot not passed to the client. Either remove \`'${prop}'\` from \`passToClient\` or make sure that \`pageContext['${prop}']\` is serializable. The \`${serializerName}\` serialization error is shown above (serialization is done with ${serializerRepo}).`);
            }
        });
        console.error(err);
        (0, utils_1.assert)(false);
    }
    return pageContextSerialized;
}
exports.serializePageContextClientSide = serializePageContextClientSide;
function addIs404ToPageProps(pageContext) {
    (0, utils_1.assert)(typeof pageContext.is404 === 'boolean');
    const pageProps = pageContext.pageProps || {};
    pageProps['is404'] = pageProps['is404'] || pageContext.is404;
    pageContext.pageProps = pageProps;
}
exports.addIs404ToPageProps = addIs404ToPageProps;
//# sourceMappingURL=serializePageContextClientSide.js.map