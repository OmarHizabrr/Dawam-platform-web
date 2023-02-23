const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      safe: true,
      systemvars: true
    }),
    new HtmlWebpackPlugin({
      title: 'Football Update WPA',
      template: path.resolve('public/index.html')
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true
    }),
    new CopyWebpackPlugin([
      { from: 'public/images', to: 'images' },
      { from: 'public/manifest', to: 'manifest' }
    ]),
    new webpack.HotModuleReplacementPlugin()
  ]
};
