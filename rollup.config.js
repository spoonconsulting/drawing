import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import coffeescript from 'rollup-plugin-coffee-script'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const WATCH_ONLY = !process.env.ROLLUP_WATCH;
const PORT = process.env.PORT || 10001;

export default {
  input: 'src/drawing.coffee',
  output: [
    {
      name: 'Drawing',
      file: 'dist/drawing.js',
      format: 'umd',
      sourcemap: true
    },
    {
      name: 'Drawing',
      file: 'dist/drawing.min.js',
      format: 'umd',
      sourcemap: true,
      plugins: [
        terser()
      ]
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    coffeescript(),
    (WATCH_ONLY ? null :
      serve({
        contentBase: ['dist', 'static'],
        port: PORT
      })
    ),
    (WATCH_ONLY ? null :
      livereload({
        watch: ['dist', 'static']
      })
    )
  ]
};
