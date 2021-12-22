import { assert, assertUsage, checkType, hasProp, isPromise, objectAssign } from '../../shared/utils';
import { injectAssets, injectAssetsAfterRender, injectAssetsBeforeRender } from './injectAssets';
import { manipulateStream, isStream, streamToString } from './stream';
// Public
export { escapeInject };
export { dangerouslySkipEscape };
// Private
export { renderHtml };
export { isDocumentHtml };
export { getHtmlString };
const __template = Symbol('__template');
function isDocumentHtml(something) {
    if (isTemplateWrapped(something) || isEscapedString(something) || isStream(something)) {
        checkType(something);
        return true;
    }
    return false;
}
async function renderHtml(documentHtml, pageContext, renderFilePath, onErrorWhileStreaming) {
    if (isEscapedString(documentHtml)) {
        let htmlString = getEscapedString(documentHtml);
        htmlString = await injectAssets(htmlString, pageContext);
        return htmlString;
    }
    if (isStream(documentHtml)) {
        const stream = documentHtml;
        const result = await renderHtmlStream(stream, {
            pageContext,
            onErrorWhileStreaming,
        });
        if ('errorBeforeFirstData' in result) {
            return { hookError: result.errorBeforeFirstData };
        }
        else {
            return result.stream;
        }
    }
    if (isTemplateWrapped(documentHtml)) {
        const templateContent = documentHtml[__template];
        const render = renderTemplate(templateContent, renderFilePath);
        if (render.type === 'string') {
            let htmlString = render.value;
            htmlString = await injectAssets(htmlString, pageContext);
            return htmlString;
        }
        if (render.type === 'stream') {
            const result = await renderHtmlStream(render.stream, {
                injectString: {
                    stringBegin: render.stringBegin,
                    stringEnd: render.stringEnd,
                },
                pageContext,
                onErrorWhileStreaming,
            });
            if ('errorBeforeFirstData' in result) {
                return { hookError: result.errorBeforeFirstData };
            }
            else {
                return result.stream;
            }
        }
        checkType(render);
        assert(false);
    }
    checkType(documentHtml);
    assert(false);
}
async function renderHtmlStream(streamOriginal, { injectString, pageContext, onErrorWhileStreaming, }) {
    const opts = {
        onErrorWhileStreaming,
    };
    if (injectString) {
        let stringEndTransformed = null;
        objectAssign(opts, {
            injectStringAtBegin: async () => {
                const splitter = '<span>__VITE_PLUGIN_SSR__SPLITTER__</span>';
                let htmlWrapper = injectString.stringBegin + splitter + injectString.stringEnd;
                htmlWrapper = await injectAssetsBeforeRender(htmlWrapper, pageContext);
                assertUsage(htmlWrapper.includes(splitter), "You are using an HTML transformer that conflicts with vite-plugin-ssr's HTML streaming support. Open a new GitHub ticket so we can discuss a solution.");
                const [stringBegin, _stringEnd] = htmlWrapper.split(splitter);
                assert(_stringEnd !== undefined && stringBegin !== undefined);
                assert(stringEndTransformed === null);
                stringEndTransformed = _stringEnd;
                assert(stringEndTransformed !== null);
                return stringBegin;
            },
            injectStringAtEnd: async () => {
                assert(stringEndTransformed !== null);
                stringEndTransformed = await injectAssetsAfterRender(stringEndTransformed, pageContext);
                return stringEndTransformed;
            },
        });
    }
    return await manipulateStream(streamOriginal, opts);
}
function isTemplateWrapped(something) {
    return hasProp(something, __template);
}
function isEscapedString(something) {
    const result = hasProp(something, __escaped);
    if (result) {
        assert(hasProp(something, __escaped, 'string'));
        checkType(something);
    }
    return result;
}
function getEscapedString(escapedString) {
    let htmlString;
    assert(hasProp(escapedString, __escaped));
    htmlString = escapedString[__escaped];
    assert(typeof htmlString === 'string');
    return htmlString;
}
function escapeInject(templateStrings, ...templateVariables) {
    return {
        [__template]: {
            templateStrings,
            templateVariables: templateVariables,
        },
    };
}
const __escaped = Symbol('__escaped');
function dangerouslySkipEscape(alreadyEscapedString) {
    return _dangerouslySkipEscape(alreadyEscapedString);
}
function _dangerouslySkipEscape(arg) {
    if (hasProp(arg, __escaped)) {
        assert(isEscapedString(arg));
        return arg;
    }
    assertUsage(!isPromise(arg), `[dangerouslySkipEscape(str)] Argument \`str\` is a promise. It should be a string instead. Make sure to \`await str\`.`);
    assertUsage(typeof arg === 'string', `[dangerouslySkipEscape(str)] Argument \`str\` should be a string but we got \`typeof str === "${typeof arg}"\`.`);
    return { [__escaped]: arg };
}
function renderTemplate(templateContent, renderFilePath) {
    let stringBegin = '';
    let stream = null;
    let stringEnd = '';
    const addString = (str) => {
        assert(typeof str === 'string');
        if (stream === null) {
            stringBegin += str;
        }
        else {
            stringEnd += str;
        }
    };
    const { templateStrings, templateVariables } = templateContent;
    for (const i in templateVariables) {
        addString(templateStrings[i]);
        const templateVar = templateVariables[i];
        // Process `dangerouslySkipEscape()`
        if (isEscapedString(templateVar)) {
            const htmlString = getEscapedString(templateVar);
            // User used `dangerouslySkipEscape()` so we assume the string to be safe
            addString(htmlString);
            continue;
        }
        // Process `escapeInject` tag composition
        if (isTemplateWrapped(templateVar)) {
            const templateContentInner = templateVar[__template];
            const render = renderTemplate(templateContentInner, renderFilePath);
            assertUsage(!(stream !== null && render.type === 'stream'), `You are trying to eject two streams in your \`escapeInject\` template tag of your render() hook exported by ${renderFilePath}. Inject only one stream instead.`);
            if (render.type === 'string') {
                addString(render.value);
            }
            else if (render.type === 'stream') {
                addString(render.stringBegin);
                stream = render.stream;
                addString(render.stringEnd);
            }
            else {
                assert(false);
            }
            continue;
        }
        if (isStream(templateVar)) {
            stream = templateVar;
            continue;
        }
        // Escape untrusted template variable
        addString(escapeHtml(toString(templateVar)));
    }
    assert(templateStrings.length === templateVariables.length + 1);
    addString(templateStrings[templateStrings.length - 1]);
    if (stream === null) {
        assert(stringEnd === '');
        return {
            type: 'string',
            value: stringBegin,
        };
    }
    return {
        type: 'stream',
        stream,
        stringBegin,
        stringEnd,
    };
}
function toString(val) {
    if (val === null || val === undefined) {
        return '';
    }
    return String(val);
}
function escapeHtml(unsafeString) {
    // Source: https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript/6234804#6234804
    const safe = unsafeString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    return safe;
}
async function getHtmlString(htmlRender) {
    if (typeof htmlRender === 'string') {
        return htmlRender;
    }
    if (isStream(htmlRender)) {
        return streamToString(htmlRender);
    }
    checkType(htmlRender);
    assert(false);
}
//# sourceMappingURL=renderHtml.js.map