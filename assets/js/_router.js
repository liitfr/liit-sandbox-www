// TODO : Support inline scripts ?

const controllers = require('./_controllers.js')
const pagejs = require('page')

// initialRender = true when website is displayed for the first time
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

// Since we can't pass parameters to router's callbacks,
// we need to resolve path again in render ...
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
  // If it's the first page displayed by visitor
  if (initialRender) {
    $('script').each(function (id, el) {
      loadedScripts.push($(el).attr('src'))
    })
    initialRender = false
    // STOP HERE !
    return initialRender
  }
  if (previousPath && previousPath === ctx.path) { return false }
  ctx.data = []
  // Continue
  next()
}

// Update DOM elements
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
    // If encountered script has never been loaded
    if (loadedScripts.indexOf($(el).attr('src')) === -1 && $(el).attr('src')) {
      $.when(cachedScript($(el).attr('src'))).done(function () {
        loadedScripts.push($(el).attr('src'))
      })
    // If script has already been loaded and should run everytime page is displayed
    } else if ($(el).attr('data-hot-reload') === 'true') {
      // Run declared function
      window[config.spAppName][$(el).attr('data-script-name')][$(el).attr('data-function-name')]()
    }
  })
}

// Start the router
function run () {
  // Declare all pages
  $.each(pages, function (name, page) {
    // Link pages to client templates
    page.generation = require('!reshape?locals=false!../../views/' + page.view)
    pagejs(new RegExp(page.path, 'i'), prepare, controllers[name], render)
  })
  // If request can't be resolved, redirect to error 404
  pagejs('*', config.sp404Page)
  // Start
  pagejs()
}

// -----------------------------------------------------------------------------

module.exports = {
  run: run
}
