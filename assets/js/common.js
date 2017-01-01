const FastClick = require('fastclick')
const plugins = require('./_plugins.js')
const router = require('./_router.js')

router.run()

$(function() {
    FastClick.attach(document.body)
})

$.cachedScript = (url, options) => {
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  })
  return jQuery.ajax(options)
}
