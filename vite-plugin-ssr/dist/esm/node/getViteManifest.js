import { getSsrEnv } from './ssrEnv';
import { assert } from '../shared/utils';
export { setViteManifest };
export { getViteManifest };
var clientManifest = null;
var serverManifest = null;
var pluginManifest = null;
function getViteManifest() {
    const { root, outDir } = getSsrEnv();
    const outDirPath = `${root}/${outDir}`;
    const clientManifestPath = `${outDirPath}/client/manifest.json`;
    const serverManifestPath = `${outDirPath}/server/manifest.json`;
    const pluginManifestPath = `${outDirPath}/client/vite-plugin-ssr.json`;
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
    if (!pluginManifest) {
        try {
            pluginManifest = require(pluginManifestPath);
        }
        catch (err) { }
    }
    return {
        clientManifest,
        serverManifest,
        clientManifestPath,
        serverManifestPath,
        pluginManifest,
        pluginManifestPath,
        outDirPath,
    };
}
function setViteManifest(manifests) {
    clientManifest = manifests.clientManifest;
    serverManifest = manifests.serverManifest;
    pluginManifest = manifests.pluginManifest;
    assert(clientManifest && serverManifest && pluginManifest);
}
//# sourceMappingURL=getViteManifest.js.map