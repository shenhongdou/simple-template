
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const fs = require('fs')
const { transformFromAst } = require('@babel/core')
const path = require('path')

class Webpack {
  constructor (options) {
    const { entry, output } = options
    this.entry = entry
    this.output = output
    this.modules = []
  }

  run () {
    console.log('run')
    const res = this.parse(this.entry)
    this.modules.push(res)

    for (let i=0; i< this.modules.length; i++) {
      const { dependencies } = this.modules[i]
      Object.values(dependencies).forEach(d => {
        this.modules.push(this.parse(d))
      })
    }

    const obj = this.modules.reduce((acc, cur) => {
      acc[cur.entry] = {
        dependencies: cur.dependencies,
        code: cur.code
      }

      return acc
    }, {})

    this.genFile(obj)
  }

  parse (entry) {
    const content = fs.readFileSync(entry, 'utf-8')
    const ast = parser.parse(content, {
      sourceType: 'module'
    })

    const dependencies = {}
    console.log(ast.program.body, 'ast')
    traverse(ast, {
      ImportDeclaration: ({ node }) => {
        const newPathName = path.join(path.dirname(entry), node.source.value)
        dependencies[node.source.value] = newPathName
      }
    })

    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })

    return {
      entry,
      dependencies,
      code
    }

  }

  genFile (code) {
    console.log(code, 'code')
    const outputPath = path.resolve(this.output.path, this.output.filename)
    if (!fs.existsSync(this.output.path)) {
      fs.mkdirSync(this.output.path)
    }

    const bundle = `(function (graph) {
  function require(module) {
    const exports = {}

    function reRequire(relativePath) {
      return require(graph[module].dependencies[relativePath])
    }

    (function (require, exports, code) {
      eval(code)
    })(reRequire, exports, graph[module].code)

    return exports
  }

  require('${this.entry}')
})(${JSON.stringify(code)})`

    fs.writeFileSync(outputPath, bundle, 'utf-8')
  }
}

module.exports = Webpack