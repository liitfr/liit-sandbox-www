// TODO: css source map ?
// TODO: Vendor vs webpack require ?
// TODO : Remove images from .gitignore
// BUG : Github doesn't display good technology (linguist)
// TODO : add new feature to spike-contentful : export json per model
// BUG : la notation coffee $ est toujours acceptée ? (nom des pages par ex)

const Contentful = require('spike-contentful')
const cssStandards = require('spike-css-standards')
const dotEnv = require('dotenv').config()
const HardSourcePlugin = require('hard-source-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const htmlStandards = require('reshape-standard')
const jsStandards = require('babel-preset-latest')
const lost = require('lost')
const markdown = require('markdown-it')()
const normalize = require('postcss-normalize')
const path = require('path')
const slug = require('slug')

var locals = {
  markdown: markdown,
  slug: slug
}

module.exports = {

  outputDir: process.env.SP_OUTPUT_DIR,
  dumpDirs: ['views', 'assets', 'config'],
  ignore: ['**/layout.sgr', '**/_*', '.*', 'assets/img/.gitkeep', '_cache/**', 'readme.md', 'license.md'],
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
      locals
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
    'js/main': ['./assets/js/index.js'],
    'js/plugins': ['./assets/js/plugins.js']
  },

// -----------------------------------------------------------------------------

  module: {
    loaders: [
    ]
  },

// -----------------------------------------------------------------------------

  plugins: [
    new HardSourcePlugin({
      environmentPaths: { root: __dirname },
      recordsPath: path.join(__dirname, '_cache/records.json'),
      cacheDirectory: path.join(__dirname, '_cache/hard_source_cache')
    }),
    new Contentful({
      addDataTo: locals,
      accessToken: process.env.CF_CONTENT_DELIVERY_API,
      spaceId: process.env.CF_SPACE_ID,
      contentTypes: [
        {
          name: 'blog_posts',
          id: process.env.CF_MODEL_BLOGPOST,
          // ordered: true,
          // filters: {
          //   order: 'sys.createdAt'
          // },
          template: {
            path: 'views/templates/_blogpost.sgr',
            output: (blogpost) => { return 'blog/' + slug(blogpost.blogUrl) + '.html' }
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
          id: process.env.CF_MODEL_INTERNETFACT
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
      json: path.join(process.env.SP_API_DIR, 'all_data.json')
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
    })
  ]

}
