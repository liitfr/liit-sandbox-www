// You can find more details here : http://roots.cx/articles/roots-with-gulp
const del = require('del')
const dotEnv = require('dotenv').config()
const gulp = require('gulp')
const path = require('path')
const Q = require('q')
const runSequence = require('run-sequence')
const $ = require('gulp-load-plugins')()
const Spike = require('spike-core')

let project = new Spike({ root: __dirname })
var outputDir = process.env.SP_OUTPUT_DIR
var apiDir = process.env.SP_API_DIR
var deferredRemove = Q.defer()
var deferredCompile = Q.defer()

project.on('compile', () => {
  deferredCompile.resolve()
})
project.on('done', console.log)
project.on('error', console.error)
project.on('info', console.log)
project.on('remove', () => {
  deferredRemove.resolve()
})
project.on('success', console.log)
project.on('warning', console.error)

// -----------------------------------------------------------------------------

gulp.task('emptycache', function() {
  return del([
    path.join('_cache/hard_source_cache'),
    path.join('_cache/records.json')
  ])
})

gulp.task('clean', function(){
  project.clean()
  return deferredRemove.promise
})

gulp.task('compile', ['emptycache', 'clean'], function(){
  var {id, compiler} = project.compile()
  return deferredCompile.promise
})

gulp.task('addhash', ['compile'], function(){
  return gulp.src([
    path.join(outputDir, '/css/*.css'),
    path.join(outputDir, '/js/*.js'),
    path.join(outputDir, '/img/**/*.{gif,jpeg,jpg,png,svg}')
  ], {base: outputDir})
    .pipe($.rev())
    .pipe(gulp.dest(outputDir))
    .pipe($.revCssUrl())
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest())
    .pipe(gulp.dest(path.join(outputDir, apiDir)))
})

gulp.task('replace', ['addhash'], function(){
  var manifest = gulp.src(path.join(outputDir, apiDir, '/rev-manifest.json'))
  return gulp.src(path.join(outputDir, '/**/*.html'))
    .pipe($.revReplace({manifest: manifest}))
    .pipe(gulp.dest(outputDir))
})

gulp.task('favicons', ['compile'], function(){
  var faviconsCode = require(path.join(__dirname, outputDir, apiDir, '/favicons.json')).html.join('')
  return gulp.src(path.join(outputDir, '/**/*.html'))
    .pipe($.injectString.after('</title>', faviconsCode))
    .pipe(gulp.dest(outputDir))
})

gulp.task('delete', ['favicons', 'replace'], function() {
  return del([
    path.join(outputDir, apiDir, '/rev-manifest.json'),
    path.join(outputDir, apiDir, '/favicons.json'),
    path.join(outputDir, '/img/favicons/.cache'),
    path.join(outputDir, '/js/**/*.js.map')
  ])
})

gulp.task('default', ['emptycache', 'clean', 'compile', 'addhash', 'replace', 'favicons', 'delete'], function(){

})
