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

blog = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        blog_posts: loadedJson[config.spApiAlldata].blog_posts,
        blog_categories: loadedJson[config.spApiAlldata].blog_categories
      }
    }
    next()
  }
  $.when($.cachedJson(config.spApiAlldata)).then(success, defaultError)
}

blogpost = (ctx, next) => {
  success = () => {
    findBlogpost = $.grep(loadedJson[config.spApiAlldata].blog_posts, (blogpost, index) => (
      blogpost.blogUrl === ctx.path.replace(/^\/blog\/|.html?$|(?:.html?)?\?.*$|(?:.html?)?\#.*$/gi,'')
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
  $.when($.cachedJson(config.spApiAlldata)).then(success, defaultError)
}

discoverybatch = (ctx, next) => {
  success = () => {
    findDiscoverybatch = $.grep(loadedJson[config.spApiAlldata].discovery_batches, (discoverybatch, index) => (
      discoverybatch.batchNumber === ctx.path.replace(/^\/fournees\/numero|.html?$|(?:.html?)?\?.*$|(?:.html?)?\#.*$/gi,'')
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
  $.when($.cachedJson(config.spApiAlldata)).then(success, defaultError)
}

discoverybatches = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        discovery_batches: loadedJson[config.spApiAlldata].discovery_batches
      }
    }
    next()
  }
  $.when($.cachedJson(config.spApiAlldata)).then(success, defaultError)
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
        internet_facts: loadedJson[config.spApiAlldata].internet_facts
      }
    }
    next()
  }
  $.when($.cachedJson(config.spApiAlldata)).then(success, defaultError)
}

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
