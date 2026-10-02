// Compile server modules in memory and inject storage/cookie adapters. No network
// calls or live credentials are used by the route tests.
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')

exports.createLoader = function createLoader(mocks = {}) {
  const cache = new Map()
  function load(name) {
    let file = path.isAbsolute(name) ? name : path.join(root, name)
    if (!path.extname(file)) file += '.ts'
    if (cache.has(file)) return cache.get(file).exports
    const instance = new Module(file, module)
    cache.set(file, instance)
    instance.filename = file
    instance.paths = Module._nodeModulePaths(path.dirname(file))
    instance.require = specifier => {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier]
      if (specifier === 'server-only') return {}
      if (specifier.startsWith('@/')) return load(specifier.slice(2))
      if (specifier.startsWith('.')) return load(path.resolve(path.dirname(file), specifier))
      return require(specifier)
    }
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } })
    instance._compile(output.outputText, file)
    return instance.exports
  }
  return load
}
