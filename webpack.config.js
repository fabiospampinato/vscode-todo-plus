// @ts-check

'use strict'

const path = require('node:path')

// @ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig */

const config = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    fsevents: 'commonjs fsevents'
  },
  node: {
    __dirname: false
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      ]
    }]
  }
}



module.exports = config;
