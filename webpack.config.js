const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/drawing.js',
  devtool: 'none',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'Drawing',
    libraryTarget: 'umd',
    filename: 'drawing.js'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'raw-loader'
        }
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { ie: '10' } }]
            ]
          }
        }
      }
    ]
  },
  optimization: { minimize: false }
}
