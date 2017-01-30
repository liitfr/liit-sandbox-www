// TODO : window.location.href with .html (reference comments) ?
// TODO : attention aux extensions html (404) et rafraichissement F5
// TODO : canonical
// TODO : faire le tour de ul / each et mettre un message par défaut si aucune donnée
// BUG : can't minify JS !!!

const controllers = require('./_controllers.js')
const pagejs = require('page')

var initialRender = true
var loadedScripts = []
var pages = require('../../pages.json')
var previousPath
var nextPath

function cachedScript (url) {
  if (loadedScripts.indexOf(url) === -1) {
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

function resolvePath (path) {
  var requestedPage
  $.each(pages, function (name, page) {
    if (new RegExp(page.path, 'i').test(path)) {
      requestedPage = name
      return false
    }
  })
  return requestedPage
}

function prepare (ctx, next) {
  ctx.handled = true
  if (initialRender) {
    $('script').each(function (id, el) {
      loadedScripts.push(el.outerHTML)
    })
    initialRender = false
    return initialRender
  }
  if (previousPath && previousPath === ctx.path) { return false }
  ctx.data = []
  next()
}

function render (ctx) {
  previousPath = ctx.path
  nextPath = resolvePath(ctx.path)
  window.scrollTo(0, 0)
  $.extend(ctx.data, {
    config: config
  })
  var generation = $(pages[nextPath].generation(ctx.data))
  document.title = generation.filter('title').text()
  $('meta[name="description"]').attr('content', generation.filter('meta[name="description"]').attr('content'))
  $('meta[name="robots"]').attr('content', generation.filter('meta[name="robots"]').attr('content'))
  $('main').html(generation.filter('main').html())
  $('body').attr('id', nextPath)
  $(generation).filter('script').each(function (id, el) {
    if (loadedScripts.indexOf(el.outerHTML) === -1 && $(el).attr('src')) {
      $.when(cachedScript($(el).attr('src'))).done(function () {
        loadedScripts.push(el.outerHTML)
      })
    } else if ($(el).attr('data-hot-reload') === 'true') {
      window[config.spAppName][$(el).attr('data-script-name')][$(el).attr('data-function-name')]()
    }
  })
}

function run () {
  $.each(pages, function (name, page) {
    page.generation = require('!reshape?locals=false!../../views/' + page.view)
    pagejs(new RegExp(page.path, 'i'), prepare, controllers[name], render)
  })
  pagejs('*', config.sp404Page)
  pagejs()
}

// -----------------------------------------------------------------------------

module.exports = {
  run: run
}
