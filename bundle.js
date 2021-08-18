

const fs = require('fs')

const Webpack = require('./webpack/index.js')
const options = require('./webpack.config')
console.log('--------')
new Webpack(options).run()
