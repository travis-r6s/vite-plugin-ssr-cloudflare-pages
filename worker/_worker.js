import { createPageRenderer, __private } from 'vite-plugin-ssr'

import { pageFiles } from '../dist/server/pageFiles'
import clientManifest from '../dist/client/manifest.json'
import serverManifest from '../dist/server/manifest.json'

__private.importBuild({ pageFiles, clientManifest, serverManifest })

const renderPage = createPageRenderer({ isProduction: true })

function isAssetUrl ( url ) {
  const { pathname } = new URL(url)
  return pathname.startsWith('/assets/')
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      // TODO: Add your custom /api/* logic here.
      return new Response('Ok');
    }
    // if (!isAssetUrl(event.request.url)) {
    //   const pageContextInit =  const pageContextInit = {
    //     url,
    //     fetch: (...args) => fetch(...args),
    //   }
    //   const pageContext = await renderPage(pageContextInit)
    //   const { httpResponse } = pageContext
    //   if (httpResponse) {
    //     const { body, statusCode, contentType } = httpResponse
    //     return new Response(body, {
    //       headers: { 'content-type': contentType },
    //       status: statusCode,
    //     })
    //   }
    // }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  }
}
