const path = require("path");

module.exports = {
  mode: "none",
  entry: {
    globeGl: "./Webpack/globeGl.js",
  },
  experiments: {
    outputModule: true
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "..", "Public/Webpack"),
    libraryTarget: "module",
    clean: true
  },
  // externalsType: "module",
  // externals: {
  //   three: "three"
  // },
  resolve: {
    alias: {
      three$: path.resolve("./node_modules/three")
    },
    fallback: {
      "crypto": false
    }
  }
};
