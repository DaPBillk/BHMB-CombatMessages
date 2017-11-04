module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: __dirname + "/build"
  },
  externals: {
    "@bhmb/bot": "window['@bhmb/bot']",
    "MessageBot": "window['@bhmb/bot'].MessageBot"
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: "raw-loader"
      },
      {
        test: /\.css$/,
        use: "raw-loader"
      }
    ]
  }
};
