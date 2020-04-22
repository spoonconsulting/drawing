import { terser } from 'rollup-plugin-terser'
import coffeescript from 'rollup-plugin-coffee-script'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const WATCH_ONLY = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/drawing.coffee',
  output: [
    {
      name: 'Drawing',
      file: 'dist/drawing.js',
      format: 'iife',
      sourcemap: true
    },
    {
      name: 'Drawing',
      file: 'dist/drawing.min.js',
      format: 'iife',
      sourcemap: true,
      plugins: [
        terser()
      ]
    }
  ],
  plugins: [
    coffeescript(),
    (WATCH_ONLY ? null :
      serve({
        contentBase: ['dist', 'static']
      })
    ),
    (WATCH_ONLY ? null :
      livereload({
        watch: ['dist', 'static']
      })
    )
  ]
};
