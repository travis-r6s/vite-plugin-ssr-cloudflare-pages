/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild')
const { default: nodeModulesPolyfills } = require('@esbuild-plugins/node-modules-polyfill')

esbuild.build({
  entryPoints: ['./worker/index.js'],
  sourcemap: false,
  outfile: './dist/client/_worker.js',
  minify: true,
  logLevel: 'info',
  platform: 'browser',
  plugins: [nodeModulesPolyfills()],
  format: 'esm',
  target: 'es2020',
  bundle: true
}).then(() => {
  console.log(`Successfully built worker.`)
}).catch(error => {
  console.error(`There was an error whilst building this worker:`)
  console.error(error)
})
