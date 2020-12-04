const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './webfront/main.js',
  mode: 'none',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/javascripts')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
               presets: [
                ['@babel/preset-env', { 'modules': false }],
                '@babel/preset-react'
              ]
            }
          }
        ],
        // node_modules は除外する
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default']
    })
  ],
  // ソースマップを有効にする
  devtool: 'source-map'
};