const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [new UglifyJsPlugin({ parallel: true })]
  },
  mode: "development",
  entry: "./public/src/app.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public/dist")
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /public\/src/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      "window.jQuery": "jquery"
    })
  ]
};
