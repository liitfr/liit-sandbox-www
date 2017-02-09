/* global $, config, DISQUS */

var d = document
var disqus_config = function () {
  this.language = config.disqusLanguage
  this.page.identifier = $('#disqus_thread').attr('data-disqus-identifier')
  this.page.url = window.location.href.split(/[?#]/)[0]
  this.page.title = document.title
}
var reset = function () {
  DISQUS.reset({
    reload: true,
    config: disqus_config
  })
}
var s = d.createElement('script')

window.disqus_config = disqus_config
s.src = '//' + config.disqusShortname + '.disqus.com/embed.js'
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s)

window[config.spAppName] = Object.assign(
  {blogpost: {
    onReload: reset
  }},
  window[config.spAppName]
)
