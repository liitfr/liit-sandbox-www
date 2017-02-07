const pagejs = require('page')

var loadedJson = []

function cachedJson (url) {
  if (loadedJson[url] === undefined) {
    var options = {
      cache: true,
      dataType: 'json',
      success: function (data) {
        loadedJson[url] = data
      },
      url: url
    }
    return $.ajax(options)
  } else {
    return loadedJson[url]
  }
}

function defaultController (ctx, next) {
  ctx.data = null
  next()
}

function defaultError () {
  pagejs.redirect(config.sp500Page)
}

// -----------------------------------------------------------------------------

function blog (ctx, next) {
  function success () {
    ctx.data = {
      contentful: {
        blog_posts: loadedJson[config.spApiBlogpost],
        blog_categories: loadedJson[config.spApiBlogcategory]
      }
    }
    next()
  }
  $.when(
    cachedJson(config.spApiBlogpost),
    cachedJson(config.spApiBlogcategory)
  ).then(success, defaultError)
}

function blogpost (ctx, next) {
  function success () {
    findBlogpost = $.grep(loadedJson[config.spApiBlogpost], function (blogpost, index) {
      return blogpost.fields.blogUrl === ctx.path.replace(/^\/blog\/|(?:\.html?)?(?:\?.*)?(?:#.*)?$/gi, '')
    })
    if (!findBlogpost.length > 0) {
      pagejs.redirect(config.sp404Page)
    } else {
      ctx.data = {
        item: findBlogpost[0]
      }
      next()
    }
  }
  $.when(cachedJson(config.spApiBlogpost)).then(success, defaultError)
}

function businessprofil (ctx, next) {
  defaultController(ctx, next)
}

function comingsoon (ctx, next) {
  defaultController(ctx, next)
}

function contact (ctx, next) {
  defaultController(ctx, next)
}

function discoverybatch (ctx, next) {
  function success () {
    findDiscoverybatch = $.grep(loadedJson[config.spApiDiscoverybatch], function (discoverybatch, index) {
      return discoverybatch.fields.batchNumber === ctx.path.replace(/^\/bookmarks\/fournee-numero|(?:\.html?)?(?:\?.*)?(?:#.*)?$/gi, '')
    })
    if (!findDiscoverybatch.length > 0) {
      pagejs.redirect(config.sp404Page)
    } else {
      ctx.data = {
        item: findDiscoverybatch[0]
      }
      next()
    }
  }
  $.when(cachedJson(config.spApiDiscoverybatch)).then(success, defaultError)
}

function discoverybatches (ctx, next) {
  function success () {
    ctx.data = {
      contentful: {
        discovery_batches: loadedJson[config.spApiDiscoverybatch]
      }
    }
    next()
  }
  $.when(cachedJson(config.spApiDiscoverybatch)).then(success, defaultError)
}

function home (ctx, next) {
  defaultController(ctx, next)
}

function internetkf (ctx, next) {
  function success () {
    ctx.data = {
      contentful: {
        internet_facts: loadedJson[config.spApiInternetfact]
      }
    }
    next()
  }
  $.when(cachedJson(config.spApiInternetfact)).then(success, defaultError)
}

function maintenance (ctx, next) {
  defaultController(ctx, next)
}

function p403 (ctx, next) {
  defaultController(ctx, next)
}

function p404 (ctx, next) {
  defaultController(ctx, next)
}

function p500 (ctx, next) {
  defaultController(ctx, next)
}

function tag (ctx, next) {
  defaultController(ctx, next)
}

function tags (ctx, next) {
  defaultController(ctx, next)
}

function technicalprofil (ctx, next) {
  defaultController(ctx, next)
}

function vision (ctx, next) {
  defaultController(ctx, next)
}

function work (ctx, next) {
  defaultController(ctx, next)
}

function works (ctx, next) {
  defaultController(ctx, next)
}

// -----------------------------------------------------------------------------

module.exports = {
  blog: blog,
  blogpost: blogpost,
  businessprofil: businessprofil,
  comingsoon: comingsoon,
  contact: contact,
  discoverybatch: discoverybatch,
  discoverybatches: discoverybatches,
  home: home,
  internetkf: internetkf,
  maintenance: maintenance,
  p403: p403,
  p404: p404,
  p500: p500,
  tag: tag,
  tags: tags,
  technicalprofil: technicalprofil,
  vision: vision,
  work: work,
  works: works
}
