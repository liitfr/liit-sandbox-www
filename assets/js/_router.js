const controllers = require('./_controllers.js')
const markdown = require('markdown-it')()
const pagejs = require('page')
const slug = require('speakingurl')

var initialRender = true
var pages = require('../../pages.json')
var previousPath = null

resolvePath = (path) => {
  var requestedPage = null
  $.each(pages, (name, page) => {
    if (new RegExp(page.path, 'i').test(path)) {
      requestedPage = name
      return false
    }
  })
  return requestedPage
}

prepare = (ctx, next) => {
  ctx.handled = true
  if (initialRender) {
    return initialRender = false
  }
  if (previousPath && previousPath == ctx.path) {
    return false
  }
  ctx.data = []
  next()
}

render = (ctx) => {
  $.extend(ctx.data, {
    md: markdown,
    slug: slug,
    config: config
  })
  var generation = $(pages[resolvePath(ctx.path)].generation(ctx.data))
  document.title = generation.filter('title').text()
  $('meta[name="description"]').attr('content', generation.filter('meta[name="description"]').attr('content'))
  $('meta[name="robots"]').attr('content', generation.filter('meta[name="robots"]').attr('content'))
  $('main').html(generation.filter('main').html())
  $('main').attr('id',generation.filter('main').attr('id'))
  var newScripts = $.grep(generation.filter('script'), (elg, ing) => {
    var addIt = true
    $('script').each((ine, ele) => {
      if(elg.outerHTML === ele.outerHTML) {
        addIt = false
        return false
      }
    })
    return addIt
  })
  $(newScripts).each((ine, ele) => {
    document.head.appendChild(ele)
  })
  window.scrollTo(0,0)
  previousPath = ctx.path
}

run = () => {
  $.each(pages, (name, page) => {
    page.generation = require('!reshape?locals=false!../../views/' + page.view)
    pagejs(new RegExp(page.path, 'i'), prepare, controllers[name], render)
  })
  pagejs('*', '/erreurs/404')
  pagejs()
}

module.exports = {
  run: run
}
