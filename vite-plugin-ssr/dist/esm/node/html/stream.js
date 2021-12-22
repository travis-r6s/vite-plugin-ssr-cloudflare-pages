import { assert, assertUsage, checkType, isObject, hasProp } from '../../shared/utils';
//import { streamNodeModuleGet as loadStreamNodeModule } from './stream/streamNodeModule'
export { getStreamReadableNode };
export { getStreamReadableWeb };
export { pipeToStreamWritableNode };
export { pipeToStreamWritableWeb };
export { manipulateStream };
export { isStream };
export { streamToString };
// Public: consumed by vite-plugin-ssr users
export { pipeWebStream };
export { pipeNodeStream };
function isStreamReadableWeb(thing) {
    return typeof ReadableStream !== 'undefined' && thing instanceof ReadableStream;
}
function isStreamReadableNode(thing) {
    if (isStreamReadableWeb(thing)) {
        return false;
    }
    // https://stackoverflow.com/questions/17009975/how-to-test-if-an-object-is-a-stream-in-nodejs/37022523#37022523
    return hasProp(thing, 'read', 'function');
}
async function streamReadableNodeToString(readableNode) {
    // Copied from: https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable/49428486#49428486
    const chunks = [];
    return new Promise((resolve, reject) => {
        readableNode.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        readableNode.on('error', (err) => reject(err));
        readableNode.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
async function streamReadableWebToString(readableWeb) {
    let str = '';
    const reader = readableWeb.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        str += value;
    }
    return str;
}
async function stringToStreamReadableNode(str) {
    const { Readable } = await loadStreamNodeModule();
    return Readable.from(str);
}
function stringToStreamReadableWeb(str) {
    // `ReadableStream.from()` spec discussion: https://github.com/whatwg/streams/issues/1018
    assertReadableStreamConstructor();
    const readableStream = new ReadableStream({
        start(controller) {
            controller.enqueue(encodeForWebStream(str));
            controller.close();
        },
    });
    return readableStream;
}
function stringToStreamPipeNode(str) {
    return (writable) => {
        writable.write(str);
        writable.end();
    };
}
function stringToStreamPipeWeb(str) {
    return (writable) => {
        const writer = writable.getWriter();
        writer.write(encodeForWebStream(str));
        writer.close();
    };
}
async function streamPipeNodeToString(streamPipeNode) {
    let str = '';
    let resolve;
    const promise = new Promise((r) => (resolve = r));
    const { Writable } = await loadStreamNodeModule();
    const writable = new Writable({
        write(chunk, _encoding, callback) {
            const s = chunk.toString();
            assert(typeof s === 'string');
            str += s;
            callback();
        },
        final(callback) {
            resolve(str);
            callback();
        },
    });
    streamPipeNode(writable);
    return promise;
}
function streamPipeWebToString(streamPipeWeb) {
    let str = '';
    let resolve;
    const promise = new Promise((r) => (resolve = r));
    const writable = new WritableStream({
        write(chunk) {
            assert(typeof chunk === 'string');
            str += chunk;
        },
        close() {
            resolve(str);
        },
    });
    streamPipeWeb(writable);
    return promise;
}
async function getStreamReadableNode(htmlRender) {
    if (typeof htmlRender === 'string') {
        return stringToStreamReadableNode(htmlRender);
    }
    if (isStreamReadableNode(htmlRender)) {
        return htmlRender;
    }
    return null;
}
async function getStreamReadableWeb(htmlRender) {
    if (typeof htmlRender === 'string') {
        return stringToStreamReadableWeb(htmlRender);
    }
    if (isStreamReadableWeb(htmlRender)) {
        return htmlRender;
    }
    return null;
}
function pipeToStreamWritableWeb(htmlRender, writable) {
    if (typeof htmlRender === 'string') {
        const streamPipeWeb = stringToStreamPipeWeb(htmlRender);
        streamPipeWeb(writable);
        return true;
    }
    const streamPipeWeb = getStreamPipeWeb(htmlRender);
    if (streamPipeWeb === null) {
        return false;
    }
    streamPipeWeb(writable);
    return true;
}
function pipeToStreamWritableNode(htmlRender, writable) {
    if (typeof htmlRender === 'string') {
        const streamPipeNode = stringToStreamPipeNode(htmlRender);
        streamPipeNode(writable);
        return true;
    }
    const streamPipeNode = getStreamPipeNode(htmlRender);
    if (streamPipeNode === null) {
        return false;
    }
    streamPipeNode(writable);
    return true;
}
async function manipulateStream(streamOriginal, { injectStringAtBegin, injectStringAtEnd, onErrorWhileStreaming, }) {
    const getManipulationHandlers = ({ writeData, closeStream, getStream, }) => {
        let resolve;
        const streamPromise = new Promise((r) => (resolve = r));
        let resolved = false;
        const write = (chunk) => {
            writeData(chunk);
            if (resolved === false) {
                resolve({ stream: getStream() });
                resolved = true;
            }
        };
        const ensureStringBegin = (() => {
            let promise = null;
            return async () => {
                if (promise === null) {
                    promise = new Promise(async (resolve) => {
                        if (injectStringAtBegin) {
                            const stringBegin = await injectStringAtBegin();
                            write(stringBegin);
                        }
                        resolve();
                    });
                }
                await promise;
            };
        })();
        const onData = async (chunk) => {
            await ensureStringBegin();
            write(chunk);
        };
        const onEnd = async () => {
            // If empty stream: the stream ends before any data was written, but we still need to ensure that we inject `stringBegin`
            await ensureStringBegin();
            if (injectStringAtEnd) {
                const stringEnd = await injectStringAtEnd();
                write(stringEnd);
            }
            closeStream();
        };
        const onError = async (err) => {
            if (resolved === false) {
                closeStream();
                // Stream has not begun yet, which means that we have sent no HTML to the browser, and we can gracefully abort the stream.
                resolve({ errorBeforeFirstData: err });
            }
            else {
                await onEnd();
                // Some HTML as already been sent to the browser
                onErrorWhileStreaming(err);
            }
        };
        return {
            onData,
            onEnd,
            onError,
            streamPromise,
        };
    };
    if (isStreamPipeNode(streamOriginal)) {
        const buffer = [];
        const { onData, onEnd, /*onError,*/ streamPromise } = getManipulationHandlers({
            writeData(chunk) {
                if (!writableOriginalReady) {
                    buffer.push(chunk);
                }
                else {
                    const write = (c) => {
                        writableOriginal.write(c);
                    };
                    if (buffer.length !== 0) {
                        buffer.forEach((c) => write(c));
                        buffer.length = 0;
                    }
                    write(chunk);
                }
            },
            closeStream() {
                if (!writableOriginalReady) {
                    return;
                }
                writableOriginal.end();
            },
            getStream() {
                checkType(pipeNodeWrapper);
                checkType(streamOriginal);
                const stream = pipeNodeWrapper;
                return stream;
            },
        });
        let writableOriginal;
        let writableOriginalReady = false;
        const pipeNodeWrapper = pipeNodeStream((writable_) => {
            writableOriginal = writable_;
            writableOriginalReady = true;
        });
        const { Writable } = await loadStreamNodeModule();
        const writableProxy = new Writable({
            async write(chunk, _encoding, callback) {
                await onData(chunk);
                callback();
            },
            async final(callback) {
                await onEnd();
                callback();
            },
        });
        const streamPipeNode = getStreamPipeNode(streamOriginal);
        streamPipeNode(writableProxy);
        return streamPromise;
    }
    if (isStreamPipeWeb(streamOriginal)) {
        const buffer = [];
        const { onData, onEnd, onError, streamPromise } = getManipulationHandlers({
            writeData(chunk) {
                if (!writableOriginalReady) {
                    buffer.push(chunk);
                }
                else {
                    const write = (c) => {
                        writerOriginal.write(encodeForWebStream(c));
                    };
                    if (buffer.length !== 0) {
                        buffer.forEach((c) => write(c));
                        buffer.length = 0;
                    }
                    write(chunk);
                }
            },
            closeStream() {
                if (!writableOriginalReady) {
                    return;
                }
                writerOriginal.close();
            },
            getStream() {
                checkType(pipeWebWrapper);
                checkType(streamOriginal);
                const stream = pipeWebWrapper;
                return stream;
            },
        });
        let writerOriginal;
        let writableOriginalReady = false;
        const pipeWebWrapper = pipeWebStream((writableOriginal) => {
            writerOriginal = writableOriginal.getWriter();
            (async () => {
                // CloudFlare workers do not implement `ready` property
                //  - https://github.com/vuejs/vue-next/issues/4287
                try {
                    await writerOriginal.ready;
                }
                catch (e) { }
                writableOriginalReady = true;
            })();
        });
        let writableProxy;
        if (typeof ReadableStream !== 'function') {
            writableProxy = new WritableStream({
                write(chunk) {
                    onData(chunk);
                },
                close() {
                    onEnd();
                },
            });
        }
        else {
            const { readable, writable } = new TransformStream();
            writableProxy = writable;
            handleReadableWeb(readable, { onData, onError, onEnd });
        }
        const streamPipeWeb = getStreamPipeWeb(streamOriginal);
        streamPipeWeb(writableProxy);
        return streamPromise;
    }
    if (isStreamReadableWeb(streamOriginal)) {
        const readableWebOriginal = streamOriginal;
        const { onData, onEnd, onError, streamPromise } = getManipulationHandlers({
            writeData(chunk) {
                controller.enqueue(encodeForWebStream(chunk));
            },
            closeStream() {
                controller.close();
            },
            getStream() {
                checkType(readableWebWrapper);
                checkType(streamOriginal);
                const stream = readableWebWrapper;
                return stream;
            },
        });
        let controller;
        assertReadableStreamConstructor();
        const readableWebWrapper = new ReadableStream({
            async start(controller_) {
                controller = controller_;
                handleReadableWeb(readableWebOriginal, { onData, onError, onEnd });
            },
        });
        return streamPromise;
    }
    if (isStreamReadableNode(streamOriginal)) {
        const readableNodeOriginal = streamOriginal;
        const { Readable } = await loadStreamNodeModule();
        // Vue doesn't always set the `read()` handler: https://github.com/brillout/vite-plugin-ssr/issues/138#issuecomment-934743375
        if (readableNodeOriginal._read === Readable.prototype._read) {
            readableNodeOriginal._read = function () { };
        }
        const readableNodeWrapper = new Readable({ read() { } });
        const { onData, onEnd, onError, streamPromise } = getManipulationHandlers({
            writeData(chunk) {
                readableNodeWrapper.push(chunk);
            },
            closeStream() {
                readableNodeWrapper.push(null);
            },
            getStream() {
                checkType(readableNodeWrapper);
                checkType(streamOriginal);
                const stream = readableNodeWrapper;
                return stream;
            },
        });
        readableNodeOriginal.on('data', async (chunk) => {
            onData(chunk);
        });
        readableNodeOriginal.on('error', async (err) => {
            onError(err);
        });
        readableNodeOriginal.on('end', async () => {
            onEnd();
        });
        return streamPromise;
    }
    assert(false);
}
async function handleReadableWeb(readable, { onData, onError, onEnd }) {
    const reader = readable.getReader();
    while (true) {
        let result;
        try {
            result = await reader.read();
        }
        catch (err) {
            onError(err);
            return;
        }
        const { value, done } = result;
        if (done) {
            break;
        }
        onData(value);
    }
    onEnd();
}
function isStream(something) {
    if (isStreamReadableWeb(something) ||
        isStreamReadableNode(something) ||
        isStreamPipeNode(something) ||
        isStreamPipeWeb(something)) {
        checkType(something);
        return true;
    }
    return false;
}
const __streamPipeWeb = Symbol('__streamPipeWeb');
function pipeWebStream(pipe) {
    return { [__streamPipeWeb]: pipe };
}
function getStreamPipeWeb(thing) {
    if (isStreamPipeWeb(thing)) {
        return thing[__streamPipeWeb];
    }
    return null;
}
function isStreamPipeWeb(something) {
    return isObject(something) && __streamPipeWeb in something;
}
const __streamPipeNode = Symbol('__streamPipeNode');
function pipeNodeStream(pipe) {
    return { [__streamPipeNode]: pipe };
}
function getStreamPipeNode(thing) {
    if (isStreamPipeNode(thing)) {
        return thing[__streamPipeNode];
    }
    return null;
}
function isStreamPipeNode(something) {
    return isObject(something) && __streamPipeNode in something;
}
async function streamToString(stream) {
    if (isStreamReadableWeb(stream)) {
        return await streamReadableWebToString(stream);
    }
    if (isStreamReadableNode(stream)) {
        return await streamReadableNodeToString(stream);
    }
    if (isStreamPipeNode(stream)) {
        return await streamPipeNodeToString(getStreamPipeNode(stream));
    }
    if (isStreamPipeWeb(stream)) {
        return await streamPipeWebToString(getStreamPipeWeb(stream));
    }
    checkType(stream);
    assert(false);
}
function assertReadableStreamConstructor() {
    assertUsage(typeof ReadableStream === 'function', 
    // Error message copied from vue's `renderToWebStream()` implementation
    `ReadableStream constructor is not available in the global scope. ` +
        `If the target environment does support web streams, consider using ` +
        `pipeToWebWritable() with an existing WritableStream instance instead.`);
}
let encoder;
function encodeForWebStream(thing) {
    if (!encoder) {
        encoder = new TextEncoder();
    }
    if (typeof thing === 'string') {
        return encoder.encode(thing);
    }
    return thing;
}
async function loadStreamNodeModule() {
    // Eval to avoid bundlers to try to include the `stream` module
    const streamModule = await eval(`import('stream')`);
    const { Readable, Writable } = streamModule;
    return { Readable, Writable };
}
//# sourceMappingURL=stream.js.map