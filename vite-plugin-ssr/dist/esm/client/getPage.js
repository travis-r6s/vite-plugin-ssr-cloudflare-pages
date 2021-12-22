import { checkType, getUrlPathname, objectAssign } from '../shared/utils';
import { assertWarning } from '../shared/utils/assert';
import { releasePageContext } from './releasePageContext';
import { loadPageFiles } from './loadPageFiles';
import { getPageContextSerializedInHtml } from './getPageContextSerializedInHtml';
export { getPage };
const urlPathnameOriginal = getUrlPathname();
async function getPage() {
    let pageContext = getPageContextSerializedInHtml();
    objectAssign(pageContext, { isHydration: true });
    const pageFiles = await loadPageFiles(pageContext);
    objectAssign(pageContext, pageFiles);
    if (pageContext._pageIsomorphicFile) {
        assertWarning(!pageContext._pageIsomorphicFile.fileExports['onBeforeRender'], `You are using Server Routing but ${pageContext._pageId} has a \`onBeforeRender()\` hook defined in a \`.page.js\` file (${pageContext._pageIsomorphicFile.filePath}). This doesn't make sense and you should define \`onBeforeRender()\` in a \`.page.server.js\` file instead. See https://vite-plugin-ssr.com/onBeforeRender-isomorphic#server-routing`);
    }
    assertPristineUrl();
    const pageContextReadyForRelease = releasePageContext(pageContext);
    checkType(pageContextReadyForRelease);
    return pageContextReadyForRelease;
}
function assertPristineUrl() {
    const urlPathnameCurrent = getUrlPathname();
    assertWarning(urlPathnameOriginal === urlPathnameCurrent, `\`getPage()\` returned page information for URL \`${urlPathnameOriginal}\` instead of \`${urlPathnameCurrent}\`. If you want to be able to change the URL (e.g. with \`window.history.pushState\`) while using \`getPage()\`, then create a new GitHub issue.`);
}
//# sourceMappingURL=getPage.js.map