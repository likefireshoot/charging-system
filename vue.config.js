const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  // publicPath: "./",
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.pdf$/,
          loader: "file-loader",
        },
        {
          test: /\.log$/,
          loader: "file-loader",
        },
      ],
    },
  },

  devServer: {
    host: "0.0.0.0",
    port: 8080,
    client: {
      overlay: false,
    },
    https: true,
    historyApiFallback: true,
    proxy: {
      "/api": {
        // target: 'http://81.69.29.7:9882/',
        // target: 'http://124.221.3.13:9882/',
        //target: "https://sushijie.mynatapp.cc",
        target: "http://jingzhoudb.mynatapp.cc",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
});
