const { defineConfig } = require("@vue/cli-service");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const config = defineConfig({
	lintOnSave: false,
	transpileDependencies: ["vuetify", "get-stream"],
	runtimeCompiler: true,
	configureWebpack: (config) => {
		if (process.env.NODE_ENV !== "production") {
			config.plugins.push(
				new BundleAnalyzerPlugin({
					defaultSizes: "gzip",
				}),
			);
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
		config.module.rules.unshift({
			test: require("path").resolve(__dirname, "node_modules/leader-line/"),
			loader: "skeleton-loader",
			options: { procedure: (content) => `${content} export default LeaderLine` },
		});
	},
	chainWebpack: (config) => {
		config.plugins.delete("prefetch");
	},
	parallel: true,
	devServer: {
		compress: true,
		port: 8080,
	},
});

module.exports = config;
