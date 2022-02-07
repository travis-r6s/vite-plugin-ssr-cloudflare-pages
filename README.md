# vite-plugin-ssr-cloudflare-pages

This is a demo project showcasing how to use [`vite-plugin-ssr`](https://vite-plugin-ssr.com) and [Cloudflare Pages](https://developers.cloudflare.com/pages/) (with [`wrangler@2`](https://github.com/cloudflare/wrangler2)) together.

### Pages setup

When adding your site to Cloudflare Pages, make sure to set the **Build command** to `npm run build`, and the **Build output directory** to `/dist/assets`. 
We run a script to bundle any server-side code into a [custom worker](https://developers.cloudflare.com/pages/platform/functions#advanced-mode), so Pages only needs to host the client-side (static) assets.
