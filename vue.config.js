const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const config = defineConfig({
	configureWebpack: (config) => {
		/** Disable typechecking via webpack plugin. */
		config.plugins = config.plugins.filter((p) => !(p instanceof ForkTsCheckerWebpackPlugin));

		if (process.env.BUNDLE_ANALYZER === "enabled") {
			config.plugins.push(new BundleAnalyzerPlugin({ defaultSizes: "gzip" }));
		}

		/** Add browser polyfills for node dependencies needed by `neat-csv`. */
		config.resolve.fallback = {
			buffer: require.resolve("buffer"),
			stream: require.resolve("stream-browserify"),
		};
	},
	devServer: {
		compress: true,
		port: 8080,
	},
	runtimeCompiler: true,
	transpileDependencies: ["vuetify"],
});

module.exports = config;
