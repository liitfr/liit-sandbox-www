require('dotenv').config({ silent: true })

const del = require('del')
const exec = require('child_process').exec
const ftp = require('vinyl-ftp')
const gulp = require('gulp')
const minimatch = require('minimatch')
const $ = require('gulp-load-plugins')()
const Q = require('q')

var deferredCompile = Q.defer()
var ftpRemoteFolder = process.env.FTP_REMOTE_FOLDER
var ftpServerConn = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  parallel: process.env.FTP_PARALLEL,
  log: $.util.log
}
var gulpFaviconDir = process.env.GU_FAV_DIR
var gulpOutputDir = process.env.GU_OUTPUT_DIR
var gulpSiteMapSiteUrl = process.env.GU_SM_SITE_URL
var gulpPersistenceDir = process.env.GU_PERSISTENCE_DIR
var spikeOutputDir = process.env.SP_OUTPUT_DIR

// Delete output folders but NEVER DELETE PERSISTENCE FOLDER since it keeps
// history of page's last modification date.
// spikeOutputDir is dumped in order to avoid dev artfacts to get uploaded to FTP
gulp.task('dump-output-folders', () => {
  return del([
    spikeOutputDir + '/**/{*,.*}',
    gulpOutputDir + '/**/{*,.*}',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir,
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{*,.*}'
  ])
})

// Execute spike compile, but not by using spike API, since spike API and
// Hard Source Cache aren't compatible !
gulp.task('compile-spike-project', ['dump-output-folders'], () => {
  exec('spike compile -e ' + process.env.GU_ENV_NAME, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`)
      return
    }
    console.log(stdout)
    console.error(stderr)
    deferredCompile.resolve()
  })
  return deferredCompile.promise
})

// Create new deployment folder and take opportunity to :
// - remove comments in js & css minified files
// - minify html files
// - remove comments in htaccess
// - htaccess and robots.txt : customize these files by overwriting .env variables
gulp.task('generate-deploy-folder', ['compile-spike-project'], () => {
  var cssFiles = $.filter('**/*.css', {restore: true})
  var htaccessFile = $.filter(file => minimatch(file.relative, '.htaccess', {dot: true}), {restore: true})
  var htmlFiles = $.filter(['**/*.{htm,html}'], {restore: true})
  var jsFiles = $.filter('**/*.js', {restore: true})
  var robotsFile = $.filter(file => minimatch(file.relative, 'robots.txt'), {restore: true})
  return gulp.src(spikeOutputDir + '/**/{*,.*}')
    .pipe(cssFiles)
    .pipe($.stripCssComments())
    .pipe(cssFiles.restore)
    .pipe(jsFiles)
    .pipe($.stripComments())
    .pipe(jsFiles.restore)
    .pipe(htmlFiles)
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(htmlFiles.restore)
    .pipe(htaccessFile)
    .pipe($.replace('__SP_403_PAGE__', process.env.SP_403_PAGE))
    .pipe($.replace('__SP_404_PAGE__', process.env.SP_404_PAGE))
    .pipe($.replace('__SP_500_PAGE__', process.env.SP_500_PAGE))
    .pipe($.replace('__GU_HTACCESS_ADMIN__', process.env.GU_HTACCESS_ADMIN))
    .pipe($.replace('__GU_HTACCESS_LANG__', process.env.GU_HTACCESS_LANG))
    .pipe($.replace('__GU_HTACCESS_TIMEZONE__', process.env.GU_HTACCESS_TIMEZONE))
    .pipe($.replace(/^(?:\s*)?#.*/gm, ''))
    .pipe($.replace(/^\s*$/gm, ''))
    .pipe(htaccessFile.restore)
    .pipe(robotsFile)
    .pipe($.replace('__GU_SM_SITE_URL__', process.env.GU_SM_SITE_URL))
    .pipe(robotsFile.restore)
    .pipe(gulp.dest(gulpOutputDir))
})

// -----------------------------------------------------------------------------
// THE FOLLOWING STEPS DEPEND ON YOUR PROJECT STRUCTURE. IN OTHER WORDS,
// ON YOUR ASSETS DEPENDENCIES. BY LACK OF TIME AND LAZINESS, I DIDN'T TRY
// TO DO A RECURSIVE CODE THAT WOULD CONVERGE TO A FULL REVISION AUTOMATICALLY
// TODO ? : RECURSIVE MANAGEMENT FOR REVISION & REPLACE ?
// -----------------------------------------------------------------------------

// hash all images and js files that aren't common.js
// Hash them first since they do not depend on any other asset.
// Css files will be hashed in next step.
// Common.js will be hashed in last step. It needs particular attention because it
// contains templates (and therefore refers to css, img, and js)
gulp.task('assets-revision-step-1', ['generate-deploy-folder'], () => {
  return gulp.src([
    gulpOutputDir + '/img/**/*.{gif,jpeg,jpg,png,svg}',
    '!' + gulpOutputDir + '/' + gulpFaviconDir + '/**/*',
    gulpOutputDir + '/js/*.js',
    '!' + gulpOutputDir + '/js/common.js'
  ], {base: gulpOutputDir})
    .pipe($.rev())
    .pipe(gulp.dest(gulpOutputDir))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest('rev-manifest-step-1.json'))
    .pipe(gulp.dest(gulpOutputDir))
})

// Update references of all images and js files that aren't common.js
// In css, html, and common.js files
gulp.task('assets-replace-step-1', ['assets-revision-step-1'], () => {
  var manifest = gulp.src(gulpOutputDir + '/rev-manifest-step-1.json')
  return gulp.src([
    gulpOutputDir + '/css/*.css',
    gulpOutputDir + '/**/*.{htm,html}',
    gulpOutputDir + '/js/common.js',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{*,.*}'
  ], {base: gulpOutputDir})
    .pipe($.revReplace({manifest: manifest}))
    .pipe(gulp.dest(gulpOutputDir))
})

// references of all images have been updated so now we can generate a hash for css files
gulp.task('assets-revision-step-2', ['assets-replace-step-1'], () => {
  return gulp.src([
    gulpOutputDir + '/css/*.css'
  ], {base: gulpOutputDir})
    .pipe($.rev())
    .pipe(gulp.dest(gulpOutputDir))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest('rev-manifest-step-2.json'))
    .pipe(gulp.dest(gulpOutputDir))
})

// Update references of css files in html and common.js files
gulp.task('assets-replace-step-2', ['assets-revision-step-2'], () => {
  var manifest2 = gulp.src(gulpOutputDir + '/rev-manifest-step-2.json')
  return gulp.src([
    gulpOutputDir + '/**/*.{htm,html}',
    gulpOutputDir + '/js/common.js',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{*,.*}'
  ], {base: gulpOutputDir})
    .pipe($.revReplace({manifest: manifest2}))
    .pipe(gulp.dest(gulpOutputDir))
})

// all assets have been hashed so now we can generate a hash for common.js
gulp.task('assets-revision-step-3', ['assets-replace-step-2'], () => {
  return gulp.src([
    gulpOutputDir + '/js/common.js'
  ], {base: gulpOutputDir})
    .pipe($.rev())
    .pipe(gulp.dest(gulpOutputDir))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest('rev-manifest-step-3.json'))
    .pipe(gulp.dest(gulpOutputDir))
})

// Update references of common.js in common.js (circular references) & html files
gulp.task('assets-replace-step-3', ['assets-revision-step-3'], () => {
  var manifest3 = gulp.src(gulpOutputDir + '/rev-manifest-step-3.json')
  return gulp.src([
    gulpOutputDir + '/**/*.{htm,html}',
    gulpOutputDir + '/js/common-*.js',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{*,.*}'
  ], {base: gulpOutputDir})
    .pipe($.revReplace({manifest: manifest3}))
    .pipe(gulp.dest(gulpOutputDir))
})

// -----------------------------------------------------------------------------
// END OF CUSTOM CODE
// -----------------------------------------------------------------------------

// Remove from deployment folder all unecessary files !
gulp.task('drop-unnecessary-files', ['assets-replace-step-3'], () => {
  return del(gulpOutputDir + '/rev-manifest*.json')
})

// Pages are always overwrited in dist folder, so we need a way to
// keep last modification dates, compilations after compilations. This is done
// By never erasing persistent folder and updating it at every new compilation.
gulp.task('pages-lastmod-update', ['assets-replace-step-3'], () => {
  return gulp.src([
    gulpOutputDir + '/**/*.{htm,html}',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{.*,*}'
  ])
    .pipe($.destClean(gulpOutputDir + '/' + gulpPersistenceDir))
    .pipe($.changed(gulpOutputDir + '/' + gulpPersistenceDir, {hasChanged: $.changed.compareSha1Digest}))
    .pipe(gulp.dest(gulpOutputDir + '/' + gulpPersistenceDir))
})

// Now we can generate sitemap.xml !
gulp.task('generate-sitemap', ['pages-lastmod-update'], () => {
  return gulp.src([
    gulpOutputDir + '/' + gulpPersistenceDir + '/**/*.{htm,html}'
  ], {base: gulpOutputDir + '/' + gulpPersistenceDir, buffer: false, read: false})
    .pipe($.sitemap({
      siteUrl: gulpSiteMapSiteUrl
    }))
    .pipe(gulp.dest(gulpOutputDir))
})

// We can now start to upload files to FTP. First we'll only upload assets files
// In order to preserve navigation for concurrent website visitors session
gulp.task('deploy-ftp-assets', ['drop-unnecessary-files', 'generate-sitemap'], () => {
  var conn = ftp.create(ftpServerConn)
  return gulp.src([
    gulpOutputDir + '/**/{*,.*}',
    '!' + gulpOutputDir + '/**/*.{htm,html}',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir,
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{.*,*}'
  ], {base: gulpOutputDir, buffer: false})
    .pipe(conn.dest(ftpRemoteFolder))
})

// Once assets have been uploaded first, we can deploy pages
gulp.task('deploy-ftp-pages', ['deploy-ftp-assets'], () => {
  var conn = ftp.create(ftpServerConn)
  return gulp.src([
    gulpOutputDir + '/**/*.{htm,html}',
    gulpOutputDir + '/sitemap.xml',
    '!' + gulpOutputDir + '/' + gulpPersistenceDir,
    '!' + gulpOutputDir + '/' + gulpPersistenceDir + '/**/{.*,*}'
  ], {base: gulpOutputDir, buffer: false})
    .pipe(conn.dest(ftpRemoteFolder))
    .pipe($.notify({
      message: 'Remote site successfully updated !',
      onLast: true}))
})

// Main task ...
gulp.task('default', [
  'dump-output-folders',
  'compile-spike-project',
  'generate-deploy-folder',
  'assets-revision-step-1',
  'assets-replace-step-1',
  'assets-revision-step-2',
  'assets-replace-step-2',
  'assets-revision-step-3',
  'assets-replace-step-3',
  'drop-unnecessary-files',
  'pages-lastmod-update',
  'generate-sitemap',
  'deploy-ftp-assets',
  'deploy-ftp-pages'
])

// -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------

// Remove old hashed assets, use it from time to time to save some room on your FTP server
// Warning : double check that gulpOutputDir is still here !
gulp.task('drop-former-assets', () => {
  var conn = ftp.create(ftpServerConn)
  return conn.clean(ftpRemoteFolder + '/**/*.{gif,jpeg,jpg,png,svg,js,css}', gulpOutputDir)
})

// Remove project folder deployed on FTP server, think twice !
gulp.task('drop-remote', () => {
  var conn = ftp.create(ftpServerConn)
  return conn.rmdir(ftpRemoteFolder, () => {
    console.log('Remote site successfully deleted !')
  })
})
