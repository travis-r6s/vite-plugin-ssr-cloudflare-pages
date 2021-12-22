import { stringify } from '@brillout/json-s';
import { isErrorPage } from '../shared/route';
import { assert, assertUsage, hasProp, isPlainObject, unique } from '../shared/utils';
export { serializePageContextClientSide };
export { addIs404ToPageProps };
function serializePageContextClientSide(pageContext) {
    const pageContextClient = { _pageId: pageContext._pageId };
    let passToClient = [...pageContext._passToClient];
    if (isErrorPage(pageContext._pageId)) {
        assert(hasProp(pageContext, 'is404', 'boolean'));
        addIs404ToPageProps(pageContext);
        passToClient.push(...['pageProps', 'is404']);
    }
    passToClient = unique(passToClient);
    passToClient.forEach((prop) => {
        pageContextClient[prop] = pageContext[prop];
    });
    if (hasProp(pageContext, '_serverSideErrorWhileStreaming')) {
        assert(pageContext._serverSideErrorWhileStreaming === true);
        pageContextClient['_serverSideErrorWhileStreaming'] = true;
    }
    assert(isPlainObject(pageContextClient));
    let pageContextSerialized;
    const serialize = stringify;
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
                assertUsage(false, `\`pageContext['${prop}']\` can not be serialized, and it therefore cannot not passed to the client. Either remove \`'${prop}'\` from \`passToClient\` or make sure that \`pageContext['${prop}']\` is serializable. The \`${serializerName}\` serialization error is shown above (serialization is done with ${serializerRepo}).`);
            }
        });
        console.error(err);
        assert(false);
    }
    return pageContextSerialized;
}
function addIs404ToPageProps(pageContext) {
    assert(typeof pageContext.is404 === 'boolean');
    const pageProps = pageContext.pageProps || {};
    pageProps['is404'] = pageProps['is404'] || pageContext.is404;
    pageContext.pageProps = pageProps;
}
//# sourceMappingURL=serializePageContextClientSide.js.map