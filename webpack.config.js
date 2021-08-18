const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  resolveLoader: {
    modules: ['node_modules', './loader']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'myLoader2',
          {
            loader: 'myLoader',
            options: {
              name: 'shenhongdou'
            }
          }
        ]
      }
    ]
  }
}