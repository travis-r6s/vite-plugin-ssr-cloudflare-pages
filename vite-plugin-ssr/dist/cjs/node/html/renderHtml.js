"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlString = exports.isDocumentHtml = exports.renderHtml = exports.dangerouslySkipEscape = exports.escapeInject = void 0;
const utils_1 = require("../../shared/utils");
const injectAssets_1 = require("./injectAssets");
const stream_1 = require("./stream");
const __template = Symbol('__template');
function isDocumentHtml(something) {
    if (isTemplateWrapped(something) || isEscapedString(something) || (0, stream_1.isStream)(something)) {
        (0, utils_1.checkType)(something);
        return true;
    }
    return false;
}
exports.isDocumentHtml = isDocumentHtml;
async function renderHtml(documentHtml, pageContext, renderFilePath, onErrorWhileStreaming) {
    if (isEscapedString(documentHtml)) {
        let htmlString = getEscapedString(documentHtml);
        htmlString = await (0, injectAssets_1.injectAssets)(htmlString, pageContext);
        return htmlString;
    }
    if ((0, stream_1.isStream)(documentHtml)) {
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
            htmlString = await (0, injectAssets_1.injectAssets)(htmlString, pageContext);
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
        (0, utils_1.checkType)(render);
        (0, utils_1.assert)(false);
    }
    (0, utils_1.checkType)(documentHtml);
    (0, utils_1.assert)(false);
}
exports.renderHtml = renderHtml;
async function renderHtmlStream(streamOriginal, { injectString, pageContext, onErrorWhileStreaming, }) {
    const opts = {
        onErrorWhileStreaming,
    };
    if (injectString) {
        let stringEndTransformed = null;
        (0, utils_1.objectAssign)(opts, {
            injectStringAtBegin: async () => {
                const splitter = '<span>__VITE_PLUGIN_SSR__SPLITTER__</span>';
                let htmlWrapper = injectString.stringBegin + splitter + injectString.stringEnd;
                htmlWrapper = await (0, injectAssets_1.injectAssetsBeforeRender)(htmlWrapper, pageContext);
                (0, utils_1.assertUsage)(htmlWrapper.includes(splitter), "You are using an HTML transformer that conflicts with vite-plugin-ssr's HTML streaming support. Open a new GitHub ticket so we can discuss a solution.");
                const [stringBegin, _stringEnd] = htmlWrapper.split(splitter);
                (0, utils_1.assert)(_stringEnd !== undefined && stringBegin !== undefined);
                (0, utils_1.assert)(stringEndTransformed === null);
                stringEndTransformed = _stringEnd;
                (0, utils_1.assert)(stringEndTransformed !== null);
                return stringBegin;
            },
            injectStringAtEnd: async () => {
                (0, utils_1.assert)(stringEndTransformed !== null);
                stringEndTransformed = await (0, injectAssets_1.injectAssetsAfterRender)(stringEndTransformed, pageContext);
                return stringEndTransformed;
            },
        });
    }
    return await (0, stream_1.manipulateStream)(streamOriginal, opts);
}
function isTemplateWrapped(something) {
    return (0, utils_1.hasProp)(something, __template);
}
function isEscapedString(something) {
    const result = (0, utils_1.hasProp)(something, __escaped);
    if (result) {
        (0, utils_1.assert)((0, utils_1.hasProp)(something, __escaped, 'string'));
        (0, utils_1.checkType)(something);
    }
    return result;
}
function getEscapedString(escapedString) {
    let htmlString;
    (0, utils_1.assert)((0, utils_1.hasProp)(escapedString, __escaped));
    htmlString = escapedString[__escaped];
    (0, utils_1.assert)(typeof htmlString === 'string');
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
exports.escapeInject = escapeInject;
const __escaped = Symbol('__escaped');
function dangerouslySkipEscape(alreadyEscapedString) {
    return _dangerouslySkipEscape(alreadyEscapedString);
}
exports.dangerouslySkipEscape = dangerouslySkipEscape;
function _dangerouslySkipEscape(arg) {
    if ((0, utils_1.hasProp)(arg, __escaped)) {
        (0, utils_1.assert)(isEscapedString(arg));
        return arg;
    }
    (0, utils_1.assertUsage)(!(0, utils_1.isPromise)(arg), `[dangerouslySkipEscape(str)] Argument \`str\` is a promise. It should be a string instead. Make sure to \`await str\`.`);
    (0, utils_1.assertUsage)(typeof arg === 'string', `[dangerouslySkipEscape(str)] Argument \`str\` should be a string but we got \`typeof str === "${typeof arg}"\`.`);
    return { [__escaped]: arg };
}
function renderTemplate(templateContent, renderFilePath) {
    let stringBegin = '';
    let stream = null;
    let stringEnd = '';
    const addString = (str) => {
        (0, utils_1.assert)(typeof str === 'string');
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
            (0, utils_1.assertUsage)(!(stream !== null && render.type === 'stream'), `You are trying to eject two streams in your \`escapeInject\` template tag of your render() hook exported by ${renderFilePath}. Inject only one stream instead.`);
            if (render.type === 'string') {
                addString(render.value);
            }
            else if (render.type === 'stream') {
                addString(render.stringBegin);
                stream = render.stream;
                addString(render.stringEnd);
            }
            else {
                (0, utils_1.assert)(false);
            }
            continue;
        }
        if ((0, stream_1.isStream)(templateVar)) {
            stream = templateVar;
            continue;
        }
        // Escape untrusted template variable
        addString(escapeHtml(toString(templateVar)));
    }
    (0, utils_1.assert)(templateStrings.length === templateVariables.length + 1);
    addString(templateStrings[templateStrings.length - 1]);
    if (stream === null) {
        (0, utils_1.assert)(stringEnd === '');
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
    if ((0, stream_1.isStream)(htmlRender)) {
        return (0, stream_1.streamToString)(htmlRender);
    }
    (0, utils_1.checkType)(htmlRender);
    (0, utils_1.assert)(false);
}
exports.getHtmlString = getHtmlString;
//# sourceMappingURL=renderHtml.js.map