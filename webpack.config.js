const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const path = require("path");

module.exports = (webpackConfigEnv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "lms",
    projectName: "front-libs",
    webpackConfigEnv,
  });

  const config = merge(defaultConfig, {
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            "vue-style-loader",
            "css-loader",
            "sass-loader",
            {
              loader: "style-resources-loader",
              options: {
                patterns: ["./src/assets/stylesheets/_core.scss"],
              },
            },
          ],
        },
        {
          test: /\.pug$/,
          oneOf: [
            {
              resourceQuery: /^\?vue/,
              use: ["pug-plain-loader"],
            },
            {
              use: ["raw-loader", "pug-plain-loader"],
            },
          ],
        },
        {
          test: /\.vue$/,
          use: ["vue-loader"],
        },
        {
          test: /\.svg$/,
          loader: "svg-inline-loader",
        },
      ],
    },
    externals: [/^@lms\/.+/],
    plugins: [new VueLoaderPlugin()],
  });

  return config;
};

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [
        path.resolve(__dirname, "./src/assets/stylesheets/_core.scss"),
      ],
    });
}
