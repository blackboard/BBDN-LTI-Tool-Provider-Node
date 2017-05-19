var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './public/src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/dist')
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: /public\/src/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      "window.jQuery": "jquery"
    }),
  ],
  resolve: {
    alias: {
      'node_modules': path.join(__dirname, 'node_modules'),
      'bower_components': path.join(__dirname, 'public/bower_components')
    }
  }
};