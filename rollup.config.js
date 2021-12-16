import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals'


export default {
  input: './worker/worker.js',
  output: {
    file: './dist/_worker.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    commonjs( {
      esmExternals: true
    }),
    json(),
    externals()
  ]
};
