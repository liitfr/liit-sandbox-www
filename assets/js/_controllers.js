const markdown = require('markdown-it')()
const pagejs = require('page')
const slug = require('slug')

var data = null

getData = () => {
  if (data !== void 0) {
    return $.get(api_alldata, (remoteData) => {
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
      },
      md: markdown,
      slug: slug
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
      blogpost.blogUrl == ctx.path.replace(/^\/blog\/|(.htm|.html)$/g,'')
    ))
    if(!findBlogpost.length > 0) {
      pagejs.redirect('/erreurs/404')
    } else {
      ctx.data = {
        item: findBlogpost[0],
        md: markdown,
        slug: slug
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

web = (ctx, next) => {
  success = () => {
    ctx.data = {
      contentful: {
        internet_facts: data.internet_facts
      },
      md: markdown
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
    web: web
}
