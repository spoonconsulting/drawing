const path = require('path');
const webpack = require('webpack');

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
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {targets: {ie: '10'}}]
            ]
          }
        }
      }
    ]
  }
};
