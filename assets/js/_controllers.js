const pagejs = require('page')

var loadedJson = []

$.cachedJson = (url) => {
  if(loadedJson[url] === undefined) {
    var options = {
      cache: true,
      dataType: 'json',
      success: (data) => {
        loadedJson[url] = data
      },
      url: url
    }
    return $.ajax(options)
  } else {
    return loadedJson[url]
  }
}

defaultController = (ctx, next) => {
  ctx.data = null
  next()
}

defaultError = () => {
  pagejs.redirect(config.sp500Page)
}

// -----------------------------------------------------------------------------

blog = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        blog_posts: loadedJson[config.spApiBlogpost],
        blog_categories: loadedJson[config.spApiBlogcategory]
      }
    }
    next()
  }
  $.when(
    $.cachedJson(config.spApiBlogpost),
    $.cachedJson(config.spApiBlogcategory)
  ).then(success, defaultError)
}

blogpost = (ctx, next) => {
  success = () => {
    findBlogpost = $.grep(loadedJson[config.spApiBlogpost], (blogpost, index) => (
      blogpost.fields.blogUrl === ctx.path.replace(/^\/blog\/|(?:\.html?)?(?:\?.*)?(?:\#.*)?$/gi,'')
    ))
    if(!findBlogpost.length > 0) {
      pagejs.redirect(config.sp404Page)
    } else {
      ctx.data = {
        item: findBlogpost[0]
      }
      next()
    }
  }
  $.when($.cachedJson(config.spApiBlogpost)).then(success, defaultError)
}

discoverybatch = (ctx, next) => {
  success = () => {
    findDiscoverybatch = $.grep(loadedJson[config.spApiDiscoverybatch], (discoverybatch, index) => (
      discoverybatch.fields.batchNumber === ctx.path.replace(/^\/fournees\/numero|(?:\.html?)?(?:\?.*)?(?:\#.*)?$/gi,'')
    ))
    if(!findDiscoverybatch.length > 0) {
      pagejs.redirect(config.sp404Page)
    } else {
      ctx.data = {
        item: findDiscoverybatch[0]
      }
      next()
    }
  }
  $.when($.cachedJson(config.spApiDiscoverybatch)).then(success, defaultError)
}

discoverybatches = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        discovery_batches: loadedJson[config.spApiDiscoverybatch]
      }
    }
    next()
  }
  $.when($.cachedJson(config.spApiDiscoverybatch)).then(success, defaultError)
}

home = (ctx, next) => {
  defaultController(ctx, next)
}

p403 = (ctx, next) => {
  defaultController(ctx, next)
}

p404 = (ctx, next) => {
  defaultController(ctx, next)
}

p500 = (ctx, next) => {
  defaultController(ctx, next)
}

web = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        internet_facts: loadedJson[config.spApiInternetfact]
      }
    }
    next()
  }
  $.when($.cachedJson(config.spApiInternetfact)).then(success, defaultError)
}

// -----------------------------------------------------------------------------

module.exports = {
  blog: blog,
  blogpost: blogpost,
  discoverybatch: discoverybatch,
  discoverybatches: discoverybatches,
  home: home,
  p403: p403,
  p404: p404,
  p500: p500,
  web: web
}
