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

  devServer: {
    historyApiFallback: true,
  },

  devtool: 'source-map',

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['eslint'],
      },
      {
        test: /emoji.less$/,
        loader: '../loader/emojiLess',
      },
    ],
    loaders: [
      {
        test: /\.less$/,
        include: path.resolve(__dirname, 'css'),
        loader: 'css!autoprefixer!less',
      },
      {
        test: path => /\.js$/.test(path) && !/\.test\.js$/.test(path),
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel'],
      },
      {
        test: /\.svg$/,
        loader: 'url?limit=1000000',
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

  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {warnings: false},
  }))
  config.plugins.push(new webpack.optimize.DedupePlugin())
}

export default config
