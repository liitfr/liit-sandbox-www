const isotope = require('isotope-layout')

var d = document
var s = d.createElement('script')
var updateCount = function () {
  DISQUSWIDGETS.getCount({reset: true})
}

s.src = '//' + config.disqusShortname + '.disqus.com/count.js'
s.id = 'dsq-count-scr'
d.body.appendChild(s)

window[config.spAppName] = Object.assign(
  {blog: {
    onReload: updateCount
  }},
  window[config.spAppName]
)
