const controllers = require('./_controllers.js')
const pagejs = require('page')

var initialRender = true
var pages = require('../../pages.json')
var previousPath = null

resolvePage = (path) => {
  var requestedPage = null
  $.each(pages, (name, page) => {
    if (new RegExp(page.path, 'i').test(path)) {
      requestedPage = name
      return false
    }
  })
  return requestedPage
}

start = (ctx, next) => {
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

finish = (ctx) => {
  requestedPage = resolvePage(ctx.path)
  document.write(pages[requestedPage].html(ctx.data))
  document.close()
  window.scrollTo(0,0)
  // flick(document.body)
  previousPath = ctx.path
}

$.each(pages, (name, page) => {
  page.html = require('!reshape?locals=false!../../views/' + page.view)
  // console.log(controllers.web)
  pagejs(new RegExp(page.path, 'i'), start, controllers[name], finish)
})

// pagejs('*', '/erreurs/404')
pagejs()
