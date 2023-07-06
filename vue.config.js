const { defineConfig } = require("@vue/cli-service");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

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
		config.plugins.push(new ProvidePlugin({ Buffer: ["buffer", "Buffer"] }));
		config.plugins.push(new ProvidePlugin({ process: "process/browser" }));
	},
	devServer: {
		compress: true,
		port: 8080,
	},
	runtimeCompiler: true,
	transpileDependencies: ["vuetify"],
});

module.exports = config;
