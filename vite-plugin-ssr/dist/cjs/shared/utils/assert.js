"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginError = exports.assertWarning = exports.assertUsage = exports.assert = void 0;
const libassert_1 = require("@brillout/libassert");
const projectInfo_1 = require("./projectInfo");
const errorPrefix = `[${projectInfo_1.projectInfo.npmPackageName}@${projectInfo_1.projectInfo.projectVersion}]`;
const internalErrorPrefix = `${errorPrefix}[Internal Failure]`;
const usageErrorPrefix = `${errorPrefix}[Wrong Usage]`;
const warningPrefix = `${errorPrefix}[Warning]`;
const numberOfStackTraceLinesToRemove = 2;
function assert(condition, debugInfo) {
    if (condition) {
        return;
    }
    const debugStr = (() => {
        if (!debugInfo) {
            return '';
        }
        const debugInfoSerialized = typeof debugInfo === 'string' ? debugInfo : '`' + JSON.stringify(debugInfo) + '`';
        return ` Debug info (this is for the ${projectInfo_1.projectInfo.projectName} maintainers; you can ignore this): ${debugInfoSerialized}.`;
    })();
    const internalError = (0, libassert_1.newError)(`${internalErrorPrefix} You stumbled upon a bug in the source code of ${projectInfo_1.projectInfo.projectName} (an internal assertion failed). This should not be happening: please reach out at ${projectInfo_1.projectInfo.githubRepository}/issues/new or ${projectInfo_1.projectInfo.discordInvite} and include this error stack (the error stack is usually enough to fix the problem). Please do reach out as it helps make ${projectInfo_1.projectInfo.projectName} more robust. A fix will be written promptly (usually under 24 hours).${debugStr}`, numberOfStackTraceLinesToRemove);
    throw internalError;
}
exports.assert = assert;
function assertUsage(condition, errorMessage) {
    if (condition) {
        return;
    }
    const whiteSpace = errorMessage.startsWith('[') ? '' : ' ';
    const usageError = (0, libassert_1.newError)(`${usageErrorPrefix}${whiteSpace}${errorMessage}`, numberOfStackTraceLinesToRemove);
    throw usageError;
}
exports.assertUsage = assertUsage;
function getPluginError(errorMessage) {
    const pluginError = (0, libassert_1.newError)(`${errorPrefix} ${errorMessage}`, numberOfStackTraceLinesToRemove);
    return pluginError;
}
exports.getPluginError = getPluginError;
function assertWarning(condition, errorMessage) {
    if (condition) {
        return;
    }
    console.warn(`${warningPrefix} ${errorMessage}`);
}
exports.assertWarning = assertWarning;
//# sourceMappingURL=assert.js.map