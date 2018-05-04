const { VueLoaderPlugin } = require('vue-loader');
const path = require('path')
const webpack = require('webpack')
require("babel-polyfill");

module.exports = {
  entry: ["babel-polyfill", './src/main.js'],
  plugins: [
    new VueLoaderPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
            'vue-style-loader',
            'css-loader',
            'sass-loader'
        ],
      },
      // use babel-loader for js files
      { test: /\.js$/, use: 'babel-loader' },
      // use vue-loader for .vue files
      { test: /\.vue$/, use: 'vue-loader' }
    ]
  },
  // default for pretty much every project
  context: __dirname,
  // specify your entry/main file
  output: {
    // specify your output directory...
    path: path.resolve(__dirname, './dist'),
    // and filename
    filename: 'vue-rich-grid.js'
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.join(__dirname, '/src'),
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
}

// if (process.env.NODE_ENV === 'production') {
//   module.exports.devtool = '#source-map'
//   module.exports.plugins = (module.exports.plugins || []).concat([
//     new webpack.DefinePlugin({
//       'process.env': {
//         NODE_ENV: '"production"'
//       }
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//       sourceMap: true,
//       compress: {
//         warnings: false
//       }
//     }),
//     new webpack.LoaderOptionsPlugin({
//       minimize: true
//     })
//   ])
// }