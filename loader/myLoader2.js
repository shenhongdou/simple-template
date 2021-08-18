module.exports = function (source) {
  const callback = this.async()
  setTimeout(() => {
    callback(null, source)
  }, 2000)
  return source
}