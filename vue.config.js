const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const config = defineConfig({
	chainWebpack: (config) => {
		config.plugins.delete("prefetch");
	},
	configureWebpack: (config) => {
		/** Disable typechecking via webpack plugin. */
		config.plugins = config.plugins.filter((p) => !(p instanceof ForkTsCheckerWebpackPlugin));

		if (process.env.NODE_ENV !== "production") {
			config.plugins.push(new BundleAnalyzerPlugin({ defaultSizes: "gzip" }));
		}

		config.module.rules.unshift({
			test: /\.worker\.ts$/,
			use: [
				{
					loader: "worker-loader",
					options: {
						inline: "no-fallback",
					},
				},
			],
		});
	},
	devServer: {
		compress: true,
		port: 8080,
	},
	runtimeCompiler: true,
	transpileDependencies: ["vuetify", "get-stream"],
});

module.exports = config;
