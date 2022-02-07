# vite-plugin-ssr-cloudflare-pages

This is a demo project showcasing how to use [`vite-plugin-ssr`](https://vite-plugin-ssr.com) and [Cloudflare Pages](https://developers.cloudflare.com/pages/) (with [`wrangler@2`](https://github.com/cloudflare/wrangler2)).

Preview: [https://vite-plugin-ssr-cloudflare-pages.pages.dev](https://vite-plugin-ssr-cloudflare-pages.pages.dev)

### Pages Setup

When adding your site to Cloudflare Pages, make sure to set the **Build command** to `npm run build`, and the **Build output directory** to `/dist/assets`. 
We run a script to bundle any server-side code into a [custom worker](https://developers.cloudflare.com/pages/platform/functions#advanced-mode), so Pages only needs to host the client-side (static) assets.

### Custom Worker

This is the same worker that is used in the `vite-plugin-ssr` demo, but in the module format instead of the service worker format. It passes any `/asset/*` requests to the `env.ASSETS.fetch` worker helper, and any page requests are handled by `vite-plugin-ssr`. It is located in `/worker/index.ts`, and bundled into the required `/dist/_worker.js` file by the [`esbuild`](https://esbuild.github.io) script (located at `./build.js`) - this step is run by the `npm run build` command, _after_ the site has been built by Vite.

### Development

We are using the same setup as the basic `vite-plugin-ssr` template, with an Express server handling our site in development. This is so we can use the Vite middleware, and not have to re-bundle and run the worker everytime we change out code.

### Previewing Locally

You can preview the site locally (as if it were deployed) using `wrangler@2` - this is a new version of the Wrangler CLI that adds support for Pages.
Make sure you have built your site using `pnpm run build`, then start the preview with `pnpm run serve`. 

> You will note that we pass the path to the client-side assets directory, as we did with the Pages setup.
