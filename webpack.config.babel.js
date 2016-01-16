import path from 'path'
import webpack from 'webpack'

import ExtractTextPlugin from 'extract-text-webpack-plugin'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'

const config = {
  entry: [
    'babel-polyfill',
    './index.js',
  ],

  output: {
    filename: 'main.[hash].js',
    path: path.join(__dirname, 'build'),
    libraryTarget: 'umd',
  },

  externals: [
    'react-dom/server',
  ],

  devServer: {
    historyApiFallback: true,
  },

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.less$/,
        include: path.resolve(__dirname, 'css'),
        loader: 'css!autoprefixer!less',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel'],
      },
      {
        test: /\.svg$/,
        loader: 'url',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new StaticSiteGeneratorPlugin('main', ['/']),
  ],
}

if (process.env.NODE_ENV === 'production') {
  const lessLoader = config.module.loaders[0]
  lessLoader.loader = ExtractTextPlugin.extract(lessLoader.loader)
  config.plugins.push(new ExtractTextPlugin('main.[contenthash].css'))

  const uglifyPlugin = new webpack.optimize.UglifyJsPlugin()
  config.plugins.push(uglifyPlugin)
}

export default config
