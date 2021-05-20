const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "none",
  entry: "./frontend/lib/entry.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "frontend"),
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),
  ],
};
