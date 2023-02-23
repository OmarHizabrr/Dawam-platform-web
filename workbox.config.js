const {GenerateSW} = require('workbox-webpack-plugin');

module.exports = {
  // ...other webpack config...
  plugins: [
    new GenerateSW({
      globDirectory: 'build',
      globPatterns: ['**/*.{html,js,css,png,jpg,jpeg,gif,svg,webp}'],
      swDest: './service-worker.js',
      exclude: ['**/*.txt'],
    })
  ]
}


