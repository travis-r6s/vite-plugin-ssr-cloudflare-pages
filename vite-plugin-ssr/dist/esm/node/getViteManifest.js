import { getSsrEnv } from './ssrEnv';
import { assert } from '../shared/utils';
export { setViteManifest };
export { getViteManifest };
var clientManifest = null;
var serverManifest = null;
function getViteManifest() {
    const { root, outDir } = getSsrEnv();
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
function setViteManifest(manifests) {
    clientManifest = manifests.clientManifest;
    serverManifest = manifests.serverManifest;
    assert(clientManifest && serverManifest);
}
//# sourceMappingURL=getViteManifest.js.map