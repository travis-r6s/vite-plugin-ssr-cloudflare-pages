import { createPageRenderer } from 'vite-plugin-ssr'
import '../dist/server/importBuild.js'

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
    if (!isAssetUrl(request.url)) {
      const pageContextInit = {
        url: request.url,
        fetch: (...args) => fetch(...args),
      }
      const pageContext = await renderPage(pageContextInit)
      const { httpResponse } = pageContext
      if (httpResponse) {
        const { body, statusCode, contentType } = httpResponse
        return new Response(body, {
          headers: { 'content-type': contentType },
          status: statusCode,
        })
      }
    }

    // Keep browser requests happy during testing
    if (request.url.includes( 'favicon' )) return new Response('', { status: 200 })

    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  }
}
