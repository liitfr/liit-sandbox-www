// TODO : window.location.href with .html ?
// BUG: check all_data + disqus access with https
// BUG: comments do not display first time when https ..;
// BUG: get json doesn't work with www.liit but work with liit
// TODO: remove test=test in blog page links

var d = document
var disqus_config = function() {
  this.language = config.disqusLanguage
  this.page.identifier = $('#disqus_thread').attr('data-disqus-identifier')
  this.page.url = window.location.href.split(/[?#]/)[0]
  this.page.title = document.title
}
var reset = function() {
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

function onReload() {
  reset()
}

window[config.spAppName] = Object.assign(
  {blogpost: {
    onReload: onReload
  }}
)
