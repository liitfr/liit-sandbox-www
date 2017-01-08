// disqus ?

const FastClick = require('fastclick')
const plugins = require('./_plugins.js')
const router = require('./_router.js')

router.run()

$(function() {
  FastClick.attach(document.body)
})

// if($('#disqus_thread').length) {
//   console.log("commentaires")
// }
// var disqus_shortname = 'example'
// var disqus_identifier = 'newid1'
// var disqus_url = 'http://example.com/unique-path-to-article-1/'
// var disqus_config = () => {
//   language = "fr"
// }
// (function() {
//   var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true
//   dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js'
//   (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq)
// })()
// var reset = function (newIdentifier, newUrl, newTitle, newLanguage) {
//   DISQUS.reset({
//     reload: true,
//     config: function () {
//       page.identifier = newIdentifie
//       page.url = newUrl
//       page.title = newTitle
//       language = newLanguage
//     }
//   })
// }
