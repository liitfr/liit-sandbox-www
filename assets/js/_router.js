const controllers = require('./_controllers.js')
const pagejs = require('page')

var initialRender = true
var loadedScripts = []
var pages = require('../../pages.json')
var previousPath = null

$.cachedScript = (url) => {
  if(loadedScripts.indexOf(url) === -1) {
    var options = {
      cache: true,
      dataType: 'script',
      url: url
    }
    return $.ajax(options)
  } else {
    return true
  }
}

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
    $('script').each((id, el) => {
      loadedScripts.push(el.outerHTML)
    })
    return initialRender = false
  }
  if (previousPath && previousPath === ctx.path) { return false }
  ctx.data = []
  next()
}

render = (ctx) => {
  previousPath = ctx.path
  window.scrollTo(0,0)
  $.extend(ctx.data, {
    config: config
  })
  // Class: hereOnly / always / once
  // 404 remove when first arrival
  var generation = $(pages[resolvePath(ctx.path)].generation(ctx.data))
  document.title = generation.filter('title').text()
  $('meta[name="description"]').attr('content', generation.filter('meta[name="description"]').attr('content'))
  $('meta[name="robots"]').attr('content', generation.filter('meta[name="robots"]').attr('content'))
  $('main').html(generation.filter('main').html())
  $('main').attr('id',generation.filter('main').attr('id'))
  $(generation).filter('script').each((id, el) => {
    if(loadedScripts.indexOf(el.outerHTML) === -1) {
      if($(el).attr('src')) {
        $.when($.cachedScript($(el).attr('src'))).done(() => {
          loadedScripts.push(el.outerHTML)
        })
      } else {
        if($(el).hasClass('reloadPlease')) {
          $('main').append(el.outerHTML)
        } else {
          $('body').append(el.outerHTML)
        }
        loadedScripts.push(el.outerHTML)
      }
    } else if($(el).hasClass('reloadPlease')) {
      if($(el).attr('src')) {
        Window[config.spAppName][$(el).attr('data-script-name')].onReload()
      } else {
        $('main').append(el.outerHTML)
      }
    }
  })
}

run = () => {
  $.each(pages, (name, page) => {
    page.generation = require('!reshape?locals=false!../../views/' + page.view)
    pagejs(new RegExp(page.path, 'i'), prepare, controllers[name], render)
  })
  pagejs('*', config.sp404Page)
  pagejs()
}

module.exports = {
  run: run
}
