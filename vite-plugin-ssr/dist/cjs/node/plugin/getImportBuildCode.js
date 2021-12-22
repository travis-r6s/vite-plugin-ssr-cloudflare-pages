"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportBuildCode = void 0;
function getImportBuildCode() {
    return `const { pageFiles } = require("./pageFiles.js");
const clientManifest = require("../client/manifest.json");
const serverManifest = require("../server/manifest.json");
const { __private: { importBuild } } = require("vite-plugin-ssr");
importBuild({ pageFiles, clientManifest, serverManifest });
`;
}
exports.getImportBuildCode = getImportBuildCode;
//# sourceMappingURL=getImportBuildCode.js.map