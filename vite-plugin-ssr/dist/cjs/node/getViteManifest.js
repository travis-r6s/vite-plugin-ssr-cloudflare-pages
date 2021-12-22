"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViteManifest = exports.setViteManifest = void 0;
const ssrEnv_1 = require("./ssrEnv");
const utils_1 = require("../shared/utils");
var clientManifest = null;
var serverManifest = null;
function getViteManifest() {
    const { root, outDir } = (0, ssrEnv_1.getSsrEnv)();
    const clientManifestPath = `${root}/${outDir}/client/manifest.json`;
    const serverManifestPath = `${root}/${outDir}/server/manifest.json`;
    if (!clientManifest) {
        try {
            clientManifest = require(clientManifestPath);
        }
        catch (err) { }
    }
    if (!serverManifest) {
        try {
            serverManifest = require(serverManifestPath);
        }
        catch (err) { }
    }
    return {
        clientManifest,
        serverManifest,
        clientManifestPath,
        serverManifestPath,
    };
}
exports.getViteManifest = getViteManifest;
function setViteManifest(manifests) {
    clientManifest = manifests.clientManifest;
    serverManifest = manifests.serverManifest;
    (0, utils_1.assert)(clientManifest && serverManifest);
}
exports.setViteManifest = setViteManifest;
//# sourceMappingURL=getViteManifest.js.map