// TODO: Vendor vs webpack require ?
// TODO : Remove images from .gitignore once they are revelant
// BUG : Github doesn't display good technology (linguist) ...

const Contentful = require('spike-contentful')
const cssStandards = require('spike-css-standards')
const dotEnv = require('dotenv').config()
const HardSourcePlugin = require('hard-source-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const htmlStandards = require('reshape-standard')
const jsStandards = require('babel-preset-latest')
const locals = {}
const lost = require('lost')
const markdown = require('markdown-it')()
const moment = require('moment')
const normalize = require('postcss-normalize')
const path = require('path')
const slug = require('speakingurl')
const urlJoin = require('url-join')
const webpack = require('webpack')

moment.locale('fr')

module.exports = {

  outputDir: process.env.SP_OUTPUT_DIR,
  dumpDirs: ['views', 'assets', 'misc'],
  ignore: [
    '**/layout.sgr',
    '**/_*',
    '.*',
    'assets/img/.gitkeep',
    '_cache/**',
    'readme.md',
    'license.md',
    '**/templates/**.sgr',
    'pages.json'
  ],
  vendor: process.env.SP_VENDOR_DIR,

// -----------------------------------------------------------------------------

  devtool: 'source-map',
  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.sss'
  },
  reshape: (ctx) => {
    return htmlStandards({
      webpack: ctx,
      locals: Object.assign(
        {config: {
          disqusSrc: process.env.DISQUS_SRC,
          googleSiteId: process.env.GOOGLE_SITE_ID,
          spMetaTitleMaxSize: process.env.SP_META_TITLE_MAX_SIZE,
          spMetaDescMaxSize: process.env.SP_META_DESC_MAX_SIZE
        }},
        locals
      )
    })
  },
  postcss: (ctx) => {
    const css = cssStandards({
      webpack: ctx,
      rucksack : {
        fallbacks: true
      }
    })
    css.plugins.push(lost())
    css.plugins.push(normalize())
    return css
  },
  babel: {
    presets: [jsStandards]
  },

// -----------------------------------------------------------------------------

  entry: {
    'js/common': ['./assets/js/common.js'],
    'js/error': ['./assets/js/error.js']
  },

// -----------------------------------------------------------------------------

  module: {
    loaders: [
      { test: /\.json$/, loader: 'json' }
    ]
  },

// -----------------------------------------------------------------------------

  plugins: [
    new Contentful({
      addDataTo: locals,
      accessToken: process.env.CF_CONTENT_DELIVERY_API,
      spaceId: process.env.CF_SPACE_ID,
      contentTypes: [
        {
          name: 'blog_posts',
          id: process.env.CF_MODEL_BLOGPOST,
          template: {
            path: 'views/templates/blogpost.sgr',
            output: (blogpost) => { return 'blog/' + slug(blogpost.blogUrl) + '.html' }
          },
          transform: (blogpost) => {
            blogpost = Contentful.transform(blogpost)
            blogpost.blogUrl = slug(blogpost.blogUrl)
            blogpost.content = markdown.render(blogpost.content)
            if(blogpost.pubDate === blogpost.lastUpdate) {
              blogpost.dateLabel = 'Publié le ' + moment(blogpost.pubDate).format("LL")
            } else {
              blogpost.dateLabel = 'Mis à jour le ' + moment(blogpost.lastUpdate).format("LL")
            }
            return blogpost
          }
        },
        {
          name: 'blog_categories',
          id: process.env.CF_MODEL_BLOGCATEGORY
        },
        {
          name: 'discoveries',
          id: process.env.CF_MODEL_DISCOVERY
        },
        {
          name: 'discovery_batches',
          id: process.env.CF_MODEL_DISCOVERYBATCH
        },
        {
          name: 'images',
          id: process.env.CF_MODEL_IMAGE
        },
        {
          name: 'internet_facts',
          id: process.env.CF_MODEL_INTERNETFACT,
          transform: (internetfact) => {
            internetfact = Contentful.transform(internetfact)
            internetfact.fact = markdown.render(internetfact.fact)
            return internetfact
          }
        },
        {
          name: 'persons',
          id: process.env.CF_MODEL_PERSON
        },
        {
          name: 'tags',
          id: process.env.CF_MODEL_TAG
        },
        {
          name: 'works',
          id: process.env.CF_MODEL_WORK
        },
        {
          name: 'work_types',
          id: process.env.CF_MODEL_WORKTYPE
        }
      ],
      json: path.join(process.env.SP_API_DIR, process.env.SP_API_ALLDATA_FILE)
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(__dirname, 'assets/img', process.env.FAVICON_FILE),
      prefix: 'img/favicons/',
      emitStats: true,
      statsFilename: path.join(process.env.SP_API_DIR, 'favicons.json'),
      persistentCache: true,
      inject: false,
      background: process.env.FAVICON_BGCOL,
      title: process.env.FAVICON_TITLE,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false
      }
    }),
    new HardSourcePlugin({
      environmentPaths: { root: __dirname },
      recordsPath: path.join(__dirname, '_cache/records.json'),
      cacheDirectory: path.join(__dirname, '_cache/hard_source_cache')
    }),
    new webpack.DefinePlugin({
      config: {
        api_alldata: JSON.stringify(urlJoin(
          process.env.SP_BASE_URL,
          process.env.SP_API_DIR,
          process.env.SP_API_ALLDATA_FILE
        )),
        disqusSrc: JSON.stringify(process.env.GOOGLE_SITE_ID),
        googleSiteId: JSON.stringify(process.env.GOOGLE_SITE_ID),
        spMetaTitleMaxSize: JSON.stringify(process.env.SP_META_TITLE_MAX_SIZE),
        spMetaDescMaxSize: JSON.stringify(process.env.SP_META_DESC_MAX_SIZE)
      }
    }),
    new webpack.ProvidePlugin({
        THREE: 'three'
    })
  ]

}
