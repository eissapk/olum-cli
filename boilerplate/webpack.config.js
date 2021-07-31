const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const WebpackPwaManifest = require('webpack-pwa-manifest');
const { title, dest, favicon, template, src, hash, comments, asyncAwait, serviceWorker, manifest } = require("./settings");

module.exports = env => {
  const mode = !!env.dev ? "development" : "production";
  const globs = [`./${src}/app.scss`, `./${src}/app.mjs`];
  const main = asyncAwait ? ["babel-polyfill", ...globs] : [...globs];

  const config = {
    stats: "errors-warnings",
    mode,
    entry: { main },
    output: {
      path: path.resolve(__dirname, dest),
      filename: hash ? `app[fullhash:${hash}].js` : `app[fullhash:5].js`,
    },
    plugins: [new HtmlWebpackPlugin({ title, template, favicon })],
    module: {
      rules: [
        {
          test: /\.(?:js|mjs)$/i,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(?:scss|sass|css)$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|svg|webp|woff|woff2|ttf|eot)$/i,
          type: "asset/resource",
        },
      ],
    },
  };

  if (mode === "development") {
    const clean = new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: [`./${dest}/**/*`] });
    config.plugins.unshift(clean);
    config.devtool = "eval-source-map";
  }

  if (mode === "production") {
    config.optimization = { minimize: true, minimizer: [new TerserPlugin({ extractComments: comments })] };
    if (serviceWorker) {
      config.plugins.push(new WorkboxPlugin.GenerateSW({ clientsClaim: true, skipWaiting: true }));
      config.plugins.push(new WebpackPwaManifest(manifest));
    }
  }

  return config;
};
