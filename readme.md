# liit-www

:beginner: Single Page Application with Spike :cactus: [http://liit.fr](http://liit.fr)  
:construction: This document is a draft :heavy_exclamation_mark: I hope it will be helpful.  
Improvements & PR are welcome !

## Making an hybrid Single Page Application with Spike

Why "hybrid" ?  
- Because on one hand, Spike will generate all your pages statically.  
- And because on the other hand, a client-side router called [page.js](https://visionmedia.github.io/page.js/), used with hand-made code will allow you to create a powerfull dynamic website

Inspiration : [mojotech website](https://www.mojotech.com/) for a porting from Roots to Spike

Bellow you'll find explanations about main components and global logic.

### pages.json file

`pages.json` takes an inventory of all pages of your website. **Here, you'll define routing rules for all of your pages** :
- `path` is a RegExp that represents urls that will drive visitor to a specific page. There are 4 common patterns of RegExp :
  1. Index of your website : `^(?:\/(?:index(?:\\.html?)?)?)?(?:\\?.*)?(?:#.*)?$`
  1. Index in a folder : `^\/folder(?:\/(?:index(?:\\.html?)?)?)?(?:\\?.*)?(?:#.*)?$`
  1. A page on the root of your website : `^\/page(?:\\.html?)?(?:\\?.*)?(?:#.*)?$`
  1. A generic page for individuals of a template : `\/folder\/(?!(?:index(?:.html?)?)?(?:\\?.*)?(?:#.*)?$).+$`  
  As you can see, these RegExp allow you to use fragment identifiers, query strings and make file extension optional
- `view` is the file that is used to generate your page during build process

An example to start with :

```json
{
  "blog": {
    "path": "^\/blog(?:\/(?:index(?:\\.html?)?)?)?(?:\\?.*)?(?:#.*)?$",
    "view": "blog/index.sgr"
  },
  "blogpost": {
    "path": "^\/blog\/(?!(?:index(?:.html?)?)?(?:\\?.*)?(?:#.*)?$).+$",
    "view": "templates/blogpost.sgr"
  },
  "home": {
    "path": "^(?:\/(?:index(?:\\.html?)?)?)?(?:\\?.*)?(?:#.*)?$",
    "view": "index.sgr"
  }
}
```

### app.js file

`pages.json` data are necessary for our client-side router, so we'll need to declare Webpack's [json loader](https://github.com/webpack-contrib/json-loader) in `app.js` in order to read json on client-side code.

```js
...
module: {
  loaders: [
    {
      test: /\.json$/,
      loader: 'json'
    }
  ]
},
...
```

If you have many pages that use specific (and maybe heavy) js code, you don't want them to be compiled in one single bundled file that would be used everywhere.   
Spike can understand that any file found in `assets/js/` that doesn't start with `_` must be considered as a `1:1` entry. This is made possible by using following piece of custom code :

```js
...
var entry = () => {
  var entry = {}
  var sourceDir = './assets/js/'
  var files = fs.readdirSync(sourceDir)
  files.forEach(file => {
    if (file.charAt(0) !== '_') {
      entry['js/' + path.parse(file).name] = [sourceDir + file]
    }
  })
  return entry
}
...
module.exports = {
  ...
  entry: entry(),
  ...
}
...
```

**Now you don't need to maintain explicitly the list of your entries anymore** :rocket:

In `assets/js/`, I would suggest to dispatch your `js` code this way :
- `common.js` contains **factorized code used everywhere** (or almost), **client-side router** and **client templates**
- `xxx.js`, `yyy.js` .. for one or many **specific** pages.
- `_lib1.js`, `_lib2.js` for **required librairies**

If your pages use local variables, then your client templates will have to be able to resolve these variables. **This is made possible by using Webpack [DefinePlugin](https://github.com/webpack/docs/wiki/list-of-plugins)** in `app.js`:

```js
new DefinePlugin({
  config: {
    spApiBlogpost: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_BLOGPOST + '.json')),
    varX: JSON.stringify(process.env.VARX),
    varY: JSON.stringify(process.env.VARY),
    ...
  }
})
```

Since there's a bug **when you use PageId plugin alongside Contentful plugin**, I've done this piece of code as a workaround. It uses benefits of `pages.json` file :

```js
const pages = require('./pages.json')
...
var pageId = (ctx) => {
  for (var page in pages) {
    if (pages.hasOwnProperty(page)) {
      if (pages[page].view === ctx.resourcePath.replace(`${path.join(__dirname, '/views/')}`, '')) {
        return page
      }
    }
  }
}
...
reshape: (ctx) => {
  return htmlStandards({
    locals: Object.assign(
      {config: {
        ...
      }},
      locals,
      {pageId: pageId(ctx)}
    ),
    webpack: ctx
  })
},
...
```

**To avoid data enrichment & cleansing on client side**, I use Contentful plugin transformations to do it during build rather than during web browsing !  
This way, **bundled js are also lighter** since you won't have to require librairies such as slugify or moment to reproduce expected behavior on client side ! :metal:

For example, the blogpost model :

```js
...
new Contentful({
  accessToken: process.env.CF_CONTENT_DELIVERY_API,
  addDataTo: locals,
  contentTypes: [
    ...
    {
      name: 'blog_posts',
      ...
      json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_BLOGPOST + '.json'),
      ...
      transform: (blogpost) => {
        blogpost.fields.blogUrl = slug(blogpost.fields.blogUrl)
        blogpost.fields.content = markdown.render(blogpost.fields.content)
        if (blogpost.fields.pubDate === blogpost.fields.lastUpdate) {
          blogpost.fields.dateLabel = 'Publié le ' + moment(blogpost.fields.pubDate).format('LL')
        } else {
          blogpost.fields.dateLabel = 'Mis à jour le ' + moment(blogpost.fields.lastUpdate).format('LL')
        }
        blogpost.fields.id = blogpost.sys.id
        return blogpost
      }
    },
    ...
```

As you can see, I extract Contentful data in separated json files. You'll see later :arrow_down: that it'll give hability to client-side controllers to ajax only necessary data ! :zap:  
:warning: json files URI must be declared in `DefinePlugin`

### .env file

Router needs following environment variables :

```js
...
SP_404_PAGE = erreurs/404
SP_500_PAGE = erreurs/500
SP_API_DIR  = api
SP_APP_NAME = liit
...
```

The router can generate two types of errors :
- 404 error will be raised if requested page isn't known by the router or its controllers.
- 500 error will be raised if for some reason, a controller cannot download remote data.  

`SP_API_DIR` is the name of the server's folder where data will be available for client-side controllers.  
`SP_APP_NAME` is the name of Window Object's entry where your app will store useful values. Read more below :arrow_down:

### In your pages

#### The layout

**You need to adopt following structure** :

```sgr
doctype html
html(class="no-js" lang="fr")
  head
    ...
    block(name="meta")
      title My website !
      meta(name="description" content="Hello World !")
      meta(name="robots" content="index, follow")
    block(name="js-head")
      ...
  body(role="document" id="{{ pageId }}")
    header
      ...
    main(role="main")
      block(name="content")
    footer
      ...
    block(name="js-body")
      script(src="/js/common.js" defer)
      ...
```

When visitor goes from one page to another, following things will happen :
- Title, meta description & meta robots will be updated
- content block will be overwrited
- body's id will be updated
- new external scripts appending js-head or js-body blocks will be ajaxed

:warning: At the present time, **only external scripts are supported** (i.e. router won't load new inline scripts)

#### Views & Templates

**If you want to use a specific external script in a page**, just add :

```sgr
...
block(name="js-body" type="append")
  script(src="/js/specific.js" data-hot-reload="true" data-script-name="specific" data-function-name="onReload" defer)
...
```

`data-hot-reload="true"` tells the router that you want to execute this script everytime the current page is displayed. If `false` or not defined, script will only be executed once.  
`data-script-name="identifier"` is a unique identifier for this script.  
`data-function-name="aFunction"` tells the router which function to execute when the current page is displayed again (`data-hot-reload` must be `true`).

### In your JS

#### \_router.js file

The **core of your single page application**. If you follow rules described in this document, you won't have to touch it ! Cheers ! :beers::sunglasses:

PS : It's good to have a look at it though. Simply speaking, router works in three steps :
1. prepare : Init router if it's the first visited page. In that case, stop routing here.
2. controller : If necessary, grab expected data on remote server with ajax.
3. render : Generate client template & Update DOM elements.

#### \_controllers.js file

In this file, router should find **one controller per page** defined in `pages.json`. No more, no less.  
:warning: Controllers must have the same name as page's key in `pages.json`.  
Basically, a controller is a function responsible for preparing data that are expected by the requested page.  
Here are three typical kinds of controller :
1. Your page doesn't need data, use `defaultController` :
```js
function businessprofil (ctx, next) {
  defaultController(ctx, next)
}
```
2. Your page need 1 or more collections of data :
```js
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
```
In english : once json files have been downloaded, push all necessary data in `ctx.data` and execute router's next step (rendering).
3. Your page displays a particular individual :
```js
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
```
After downloading related json file, you first need to identify which individual is requested & check if it actually exists before execute router's next step (rendering).

#### In your common.js file

You just have to include `const router = require('./_router.js')`.  
That way, router will always be loaded, wherever visitor enters in your website.

#### In any other "specific" js file

If you need to use hot reload feature, you'll have to declare something like this :
```js
window[config.spAppName] = Object.assign(
  {blog: {
    onReload: updateCount
  }},
  window[config.spAppName]
)
```
In this example, updateCount is the name of a function in my script.  
Router will call this function everytime visitor displays this page.  

## Integrating Spike with Gulp to deploy on a FTP / Apache server

So you want to deploy your shiny website to a remote server after publishing a new article or committing developments ? just type `$ gulp` and :boom: that's it !  
Netlify makes it awesome to use Spike, let's try to do (almost :sweat_smile:) the same with **old school Apache** ! :older_man:  
I've used Gulp to do that, but it could have been done with webpack or anything else.  
I just wanted to discover Spike and make something significant with this.

Gulp will cover three topics.
1. Deploy your up-to-date website
1. Apache support & www concerns :
  - Deploy a generated .htaccess
  - Deploy a generated sitemap.xml
  - Deploy a generated robots.txt
  - Hash assets for long term caching. This concerns images (gif, jpeg, jpg, png, svg), js & css. However json & favicons files aren't concerned.
1. Few things that didn't work with spike :
  - remove comments in minified css & js files
  - minify html

### www files

These files should be placed in a folder at the root of your project.  
Define name of this folder in `GU_WWW_DIR` environment variable (e.g. "www").

#### .htaccess

I've found an awesome .htaccess in [html5boilerplate](https://html5boilerplate.com/) project.
To generate a file that match your needs, you'll have to define folling environment variables :
- `GU_HTACCESS_ADMIN` (e.g. "mathias@liit.fr")
- `GU_HTACCESS_LANG` (e.g. "fr-FR")
- `GU_HTACCESS_TIMEZONE` (e.g. "Europe/Paris")
- `SP_403_PAGE` (e.g. "erreurs/403")
- `SP_404_PAGE` (e.g. "erreurs/404")
- `SP_500_PAGE` (e.g. "erreurs/500")

#### robots.txt

To generate this file, you'll need to define following environment variable :
- `GU_SM_SITE_URL` (e.g. "http://www.liit.fr")

#### sitemap.xml

Relax, this file will be generated by Gulp :relaxed:

### app.apache.js

This file will be used to compile your Spike project with Gulp.  
It is your production file, where you'll probably want to use things such `UglifyJsPlugin`, `DedupePlugin`, `OccurrenceOrderPlugin` and `minify` option in `cssStandards` & `htmlStandards`.  
You can customize name of this file since it's defined by following environment variables :
- `GU_ENV_NAME` (e.g. "apache")

### Gulp Tasks

#### 1. dump-output-folders

In this task, we'll delete output folders of Spike and Gulp build processes.:toilet:   
This folders are respectively defined by following environment variables :
- `SP_OUTPUT_DIR` (e.g. "public")
- `GU_OUTPUT_DIR` (e.g. "_remote")

:warning: This task never deletes persistence folder : `GU_OUTPUT_DIR/GU_PERSISTENCE_DIR` (e.g. "_persistence") since it's used in order to track `last modification date` :hourglass: of your pages.  
This information is necessary for `sitemap.xml` generation.

Spike output folder is dumped in order to avoid dev artfacts to get uploaded to your production FTP.

#### 2. compile-spike-project

Execute spike compile in `GU_ENV_NAME` environment :sparkles:

#### 3. generate-deploy-folder

Take `SP_OUTPUT_DIR` as source for this stream and create a new deployment folder `GU_OUTPUT_DIR`.  
We take opportunity to :
- remove comments in js & css minified files
- minify html files
- remove comments in htaccess
- htaccess and robots.txt : generate these files by overwriting .env variables

#### 4. Assets revision & replacement

The following steps depend on your assets dependencies graph. By lack of time and laziness, I didn't try to do a recursive task that would converge to a full revision automatically.
It would surely be an elegant solution though :tophat:

In my case :
- Images and js scripts (different than `common.js`) do not refer to any other asset
- css refers to images
- common.js refers to images, js scripts, and css (because it contains client templates)
- html pages refer to images, css, js scripts and common.js

Therefore I'll need three steps to :
1. Add a hash to assets name.
2. Update files that refer to these assets.

NB : Since I built favicons outside of Spike and Gulp, I excluded these files (inside `GU_FAV_DIR`) from these steps.

##### 4.1 assets-revision-step-1

Hash all images and js files that aren't `common.js`.  
Hash them first since they do not depend on any other asset.

##### 4.2 assets-replace-step-1

Update references of all images and js files that aren't `common.js` in css, html, and `common.js` files.

##### 4.3 assets-revision-step-2

References of all images have been updated so now we can generate a hash for css files.

##### 4.4 assets-replace-step-2

Update references of css files in html and `common.js` files.

##### 4.5 assets-revision-step-3

All assets have been hashed so now we can generate a hash for `common.js`.

##### 4.6 assets-replace-step-3

Update references of `common.js` in `common.js` (circular references) & html files.

#### 5. drop-unnecessary-files

Remove from deployment folder all unecessary files. :toilet:

#### 6. pages-lastmod-update

Pages are always overwrited in `SP_OUTPUT_DIR` folder, so we need a way to keep `last modification dates` :hourglass:, compilations after compilations.   
This is done by never erasing persistent folder (`GU_PERSISTENCE_DIR` e.g. "_persistence") and updating it at every new compilation.

#### 7. generate-sitemap

`last modification dates` have been updated, we can now generate `sitemap.xml` :tada: !  
`GU_SM_SITE_URL` is needed to define site Url (e.g. "http://www.liit.fr" )

#### 8. deploy-ftp-assets

We can now start to upload files to your FTP server. First we'll only upload assets files in order to preserve navigation for concurrent website visitors session.  
Expected environment variables are :
- `FTP_HOST`
- `FTP_PARALLEL`
- `FTP_PASSWORD`
- `FTP_REMOTE_FOLDER`
- `FTP_USER`

#### 9. deploy-ftp-pages

Once assets have been uploaded first, we can deploy pages ... And that's it :v:

#### Occasional Tasks

##### drop-former-assets

:toilet: Remove old hashed assets, use it from time to time to save some room on your FTP server.  
:warning: double check that `GU_OUTPUT_DIR` is still here ! If not, everything will vanish from your server

##### drop-remote

Remove everything on remote server :rage4:  
Think twice !

## Other technical considerations

### Favicons

I didn't find a clean way to integrate favicons generation in build process.  
So I used http://realfavicongenerator.net/ directy on their website. And it's an awesome tool !

### Standards

[html5boilerplate](https://html5boilerplate.com/)

### CSS

I used GPS CSS Methodology explained [here](https://github.com/jescalan/gps).  
Unlike JS, CSS is located in only one file. It's not that heavy :see_no_evil:

### Isotope and masonry

You want to use isotope and / or masonry with Webpack 1.x ?  
Add following code in `app.js`

```js
resolve: {
    alias: {
      'isotope': 'isotope-layout',
      'masonry': 'masonry-layout'
    }
  },
```

### Three.js

You want to use Three.js with Webpack 1.x ?  
Add following code in `app.js`

```js
new ProvidePlugin({
  THREE: 'three'
})
```

### Vendor

I only declared the most common js librairies you'll find around Internet as vendor : jQuery & masonry.   
Other librairies are required in js files. It's opinionated and could easily be discussed :relaxed:

## Setup

- make sure [node.js](http://nodejs.org) is at version >= `6`
- `npm i spike -g`
- clone this repo down and `cd` into the folder
- run `npm install`
- run `spike watch` or `spike compile`

## Testing
Tests are located in `test/**` and are powered by [ava](https://github.com/sindresorhus/ava)
- `npm install` to ensure devDeps are installed
- `npm test` to run test suite

```
                ___       ___          ___   
               /  /\     /  /\        /  /\  
 ___     ___  /  /:/    /  /:/       /  /:/  
/__/\   /  /\/__/::\   /__/::\      /  /:/   
\  \:\ /  /:/\__\/\:\__\__\/\:\__  /  /::\   
 \  \:\  /:/    \  \:\/\  \  \:\/\/__/:/\:\  
  \  \:\/:/      \__\::/   \__\::/\__\/  \:\
   \  \::/       /__/:/    /__/:/      \  \:\
    \__\/        \__\/     \__\/        \__\/

```
