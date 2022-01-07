import { createPageRenderer } from 'vite-plugin-ssr'
import '../dist/server/importBuild.js'

const renderPage = createPageRenderer({ isProduction: true })

interface EnvironmentVariables {
  EXAMPLE_SECRET: string
}

type FetchFunction = EventContext<EnvironmentVariables, '', unknown>

export default {
  async fetch (request: FetchFunction['request'], env: FetchFunction['env']) {
    // Keep browser requests happy during testing
    if (request.url.includes('favicon')) return new Response('', { status: 200 })

    if (request.url.includes('/api/')) {
      // TODO: Add your custom /api/* logic here.
      return new Response('Ok')
    }

    // Handle Asset requests
    if (request.url.includes('/assets')) return env.ASSETS.fetch(request)

    // Otherwise pass to SSR handler
    const pageContextInit = {
      url: request.url,
      fetch: (...args: [RequestInfo, RequestInit]) => fetch(...args)
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (httpResponse) {
      const { body, statusCode, contentType } = httpResponse
      return new Response(body, {
        headers: { 'content-type': contentType },
        status: statusCode
      })
    }
  }
}
