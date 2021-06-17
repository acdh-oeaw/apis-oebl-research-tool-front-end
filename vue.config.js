const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  lintOnSave: false,
  transpileDependencies: [
    'vuetify',
    'get-stream'
  ],
  runtimeCompiler: true,
  configureWebpack: (config) => {
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.GITLAB_CI === undefined
    ) {
      config
        .plugins
        .push(new BundleAnalyzerPlugin({
          defaultSizes: 'gzip'
        }))
    }
    config.module.rules.unshift({
      test: /\.worker\.ts$/,
      use: [
        {
          loader: 'worker-loader',
          options: {
            inline: 'no-fallback'
          }
        }
      ]
    })
    config.module.rules.unshift({
      test: require('path').resolve(__dirname, 'node_modules/leader-line/'),
      loader: 'skeleton-loader',
      options: { procedure: content => `${content} export default LeaderLine` }
    })
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  },
  parallel: true,
  devServer: {
    open: 'Google Chrome',
    // https: true,
    // writeToDisk: true,
    disableHostCheck: true,
    host: 'localhost',
    port: '8080',
    watchOptions: {
      poll: false
    }
  }
}
