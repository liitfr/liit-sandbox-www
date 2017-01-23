// TODO: Vendor vs webpack require ?
// TODO : Remove images from .gitignore once they are revelant
// BUG : Github doesn't display good technology (linguist) ...
// TODO : Add link rel canonical in pages ! (https://alexcican.com/post/how-to-remove-php-html-htm-extensions-with-htaccess/)

require('dotenv').config({ silent: true })

const Contentful = require('spike-contentful')
const cssStandards = require('spike-css-standards')
const HardSourcePlugin = require('hard-source-webpack-plugin')
const htmlStandards = require('reshape-standard')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const jsStandards = require('babel-preset-latest')
const locals = {}
const lost = require('lost')
const markdown = require('markdown-it')()
const moment = require('moment')
const path = require('path')
const slug = require('speakingurl')
const webpack = require('webpack')

moment.locale('fr')

module.exports = {

  babel: {
    presets: [jsStandards]
  },

  devtool: 'source-map',

  dumpDirs: ['views', 'assets', 'misc'],

  entry: {
    'js/blog': ['./assets/js/blog.js'],
    'js/blogpost': ['./assets/js/blogpost.js'],
    'js/common': ['./assets/js/common.js'],
    'js/error': ['./assets/js/error.js'],
    'js/web': ['./assets/js/web.js']
  },

  ignore: [
    '.*',
    '**/_*',
    '**/layout.sgr',
    '**/templates/**.sgr',
    '_cache/**',
    'assets/img/.gitkeep',
    'license.md',
    'pages.json',
    'readme.md'
  ],

  matchers: {
    css: '*(**/)*.sss',
    html: '*(**/)*.sgr'
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },

  outputDir: process.env.SP_OUTPUT_DIR,

  plugins: [

    new Contentful({
      accessToken: process.env.CF_CONTENT_DELIVERY_API,
      addDataTo: locals,
      contentTypes: [

        {
          filters: {
            order: 'fields.name'
          },
          id: process.env.CF_MODEL_BLOGCATEGORY,
          json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_BLOGCATEGORY + '.json'),
          name: 'blog_categories',
          transform: false
        },

        {
          filters: {
            order: '-fields.lastUpdate'
          },
          id: process.env.CF_MODEL_BLOGPOST,
          json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_BLOGPOST + '.json'),
          name: 'blog_posts',
          template: {
            output: (blogpost) => { return 'blog/' + slug(blogpost.fields.blogUrl) + '.html' },
            path: 'views/templates/blogpost.sgr'
          },
          transform: (blogpost) => {
            blogpost.fields.blogUrl = slug(blogpost.fields.blogUrl)
            blogpost.fields.content = markdown.render(blogpost.fields.content)
            if(blogpost.fields.pubDate === blogpost.fields.lastUpdate) {
              blogpost.fields.dateLabel = 'Publié le ' + moment(blogpost.fields.pubDate).format('LL')
            } else {
              blogpost.fields.dateLabel = 'Mis à jour le ' + moment(blogpost.fields.lastUpdate).format('LL')
            }
            blogpost.fields.id = blogpost.sys.id
            return blogpost
          }
        },

        {
          filters: {
            order: '-fields.batchNumber'
          },
          id: process.env.CF_MODEL_DISCOVERYBATCH,
          json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_DISCOVERYBATCH + '.json'),
          name: 'discovery_batches',
          template: {
            output: (discoverybatch) => { return 'fournees/numero' + slug(discoverybatch.fields.batchNumber) + '.html' },
            path: 'views/templates/discoverybatch.sgr'
          },
          transform: (discoverybatch) => {
            discoverybatch.fields.batchNumber = slug(discoverybatch.fields.batchNumber)
            discoverybatch.fields.pubDate = moment(discoverybatch.fields.pubDate).format('LL')
            return discoverybatch
          }
        },

        {
          filters: {
            order: 'fields.displayPriority'
          },
          id: process.env.CF_MODEL_INTERNETFACT,
          json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_INTERNETFACT + '.json'),
          name: 'internet_facts',
          transform: (internetfact) => {
            internetfact.fields.fact = markdown.render(internetfact.fields.fact)
            return internetfact
          }
        },

        {
          filters: {
            order: 'fields.tagName'
          },
          id: process.env.CF_MODEL_TAG,
          json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_TAG + '.json'),
          name: 'tags',
          transform: false
        },

        {
          filters: {
            order: '-fields.realStartDate'
          },
          id: process.env.CF_MODEL_WORK,
          json: path.join(process.env.SP_API_DIR, process.env.CF_MODEL_WORK + '.json'),
          name: 'works',
          transform: (work) => {
            work.fields.blogUrl = slug(work.fields.workUrl)
            work.fields.presentation = markdown.render(work.fields.presentation)
            if (work.fields.realStartDate === work.fields.realEndDate) {
              work.fields.dateLabel = moment(work.fields.realStartDate).format('MMM YY')
            } else {
              if(work.fields.realEndDate) {
                work.fields.dateLabel = moment(work.fields.realStartDate).format('MMM YY') + ' - ' + moment(work.fields.realEndDate).format('MMM YY')
              } else {
                work.fields.dateLabel = moment(work.fields.realStartDate).format('MMM YY') + ' - AUJ'
              }
            }
            return work
          }
        }

      ],
      spaceId: process.env.CF_SPACE_ID
    }),

    new FaviconsWebpackPlugin({
      background: process.env.FAVICON_BGCOL,
      emitStats: true,
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
      },
      inject: false,
      logo: path.join(__dirname, 'assets/img', process.env.FAVICON_FILE),
      persistentCache: true,
      prefix: 'img/favicons/',
      statsFilename: path.join(process.env.SP_API_DIR, 'favicons.json'),
      title: process.env.FAVICON_TITLE
    }),

    new HardSourcePlugin({
      cacheDirectory: path.join(__dirname, '_cache/hard_source_cache'),
      environmentPaths: { root: __dirname },
      recordsPath: path.join(__dirname, '_cache/records.json')
    }),

    new webpack.DefinePlugin({
      config: {
        disqusLanguage: JSON.stringify(process.env.DISQUS_LANGUAGE),
        disqusShortname: JSON.stringify(process.env.DISQUS_SHORTNAME),
        googleSiteId: JSON.stringify(process.env.GOOGLE_SITE_ID),
        spApiBlogcategory: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_BLOGCATEGORY + '.json')),
        spApiBlogpost: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_BLOGPOST + '.json')),
        spApiDiscoverybatch: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_DISCOVERYBATCH + '.json')),
        spApiInternetfact: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_INTERNETFACT + '.json')),
        spApiModeltag: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_TAG + '.json')),
        spApiModelwork: JSON.stringify(path.join('/', process.env.SP_API_DIR, process.env.CF_MODEL_WORK + '.json')),
        spAppName: JSON.stringify(process.env.SP_APP_NAME),
        sp404Page: JSON.stringify(process.env.SP_404_PAGE),
        sp500Page: JSON.stringify(process.env.SP_500_PAGE),
        spMetaTitleMaxSize: JSON.stringify(process.env.SP_META_TITLE_MAX_SIZE),
        spMetaDescMaxSize: JSON.stringify(process.env.SP_META_DESC_MAX_SIZE)
      }
    }),

    new webpack.ProvidePlugin({
      THREE: 'three'
    })

  ],

  postcss: (ctx) => {
    const css = cssStandards({
      rucksack : {
        fallbacks: true
      },
      webpack: ctx
    })
    css.plugins.push(lost())
    return css
  },

  reshape: (ctx) => {
    return htmlStandards({
      locals: Object.assign(
        {config: {
          googleSiteId: process.env.GOOGLE_SITE_ID,
          spMetaTitleMaxSize: process.env.SP_META_TITLE_MAX_SIZE,
          spMetaDescMaxSize: process.env.SP_META_DESC_MAX_SIZE
        }},
        locals
      ),
      webpack: ctx
    })
  },

  resolve: {
    alias: {
      'isotope': 'isotope-layout',
      'masonry': 'masonry-layout'
    }
  },

  vendor: process.env.SP_VENDOR_DIR

}
