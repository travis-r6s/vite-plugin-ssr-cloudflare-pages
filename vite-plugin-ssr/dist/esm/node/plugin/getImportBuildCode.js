export { getImportBuildCode };
function getImportBuildCode() {
    return `const { pageFiles } = require("./pageFiles.js");
const clientManifest = require("../client/manifest.json");
const serverManifest = require("../server/manifest.json");
const { __private: { importBuild } } = require("vite-plugin-ssr");
importBuild({ pageFiles, clientManifest, serverManifest });
`;
}
//# sourceMappingURL=getImportBuildCode.js.map