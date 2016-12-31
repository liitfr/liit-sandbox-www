const pagejs = require('page')

var data = null

getData = () => {
  if (data !== void 0) {
    return $.get(config.api_alldata, (remoteData) => {
      data = remoteData
    })
  } else {
    return data
  }
}

// -----------------------------------------------------------------------------

blog = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        blog_posts: data.blog_posts
      }
    }
    next()
  }
  error = () => {
    pagejs.redirect('/erreurs/505')
  }
  $.when(
    getData()
  ).then(success, error)
}

blogpost = (ctx, next) => {
  success = () => {
    findBlogpost = $.grep(data.blog_posts, (blogpost, index) => (
      blogpost.blogUrl === ctx.path.replace(/^\/blog\/|(.htm|.html)$/g,'')
    ))
    if(!findBlogpost.length > 0) {
      pagejs.redirect('/erreurs/404')
    } else {
      ctx.data = {
        item: findBlogpost[0]
      }
      next()
    }
  }
  error = () => {
    pagejs.redirect('/erreurs/505')
  }
  $.when(
    getData()
  ).then(success, error)
}

home = (ctx, next) => {
  ctx.data = null
  next()
}

p404 = (ctx, next) => {
  ctx.data = null
  next()
}

p500 = (ctx, next) => {
  ctx.data = null
  next()
}

web = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        internet_facts: data.internet_facts
      }
    }
    next()
  }
  error = () => {
    pagejs.redirect('/erreurs/505')
  }
  $.when(
    getData()
  ).then(success, error)
}

// -----------------------------------------------------------------------------

module.exports = {
  blog: blog,
  blogpost: blogpost,
  home: home,
  p404: p404,
  p500: p500,
  web: web
}
