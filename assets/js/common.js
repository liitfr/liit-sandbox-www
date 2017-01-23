const FastClick = require('fastclick')
const gsap = require('gsap')
const LogStyle = require('log-with-style')
const plugins = require('./_plugins.js')
const router = require('./_router.js')

// -----------------------------------------------------------------------------

var log_bold = 'font-weight: bold'
var log_italic = 'font-style: italic'
var log_title = 'font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000'

LogStyle('%cBienvenue !', log_title)
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', log_italic, log_bold)

router.run()

$(function() {
  FastClick.attach(document.body)
})

// -----------------------------------------------------------------------------

// var logoCenter = Math.min($('#logo-liit').attr('width'), $('#logo-liit').attr('height')) / 2
// var logoRadius = logoCenter
var logoCenter = 100
var logoRadius = 100
var logoSides = 40
var minRadius = 90
var updateInterval = 1351

function generatePoints (random) {
  return Array.apply(null, { length: logoSides }).map((obj, index) => {
    var point = generatePoint(random, index)
    return point.x + ',' + point.y
  }).join(' ')
}

function generatePoint (random, index) {
  var x = 0
  var y = -logoRadius * 0.9
  if(random) {
    y = Math.ceil(minRadius + Math.random() * (logoRadius - minRadius))
  }
  var angle = Math.PI * 2 / logoSides * index
  var cos = Math.cos(angle)
  var sin = Math.sin(angle)
  var tx = x * cos - y * sin + logoCenter
  var ty = x * sin + y * cos + logoCenter
  return { x: tx, y: ty }
}

$('#logo-liit polygon').attr('points', generatePoints(true))

function flickLogo(){
    TweenMax.to('#logo-liit polygon', updateInterval / 1000, { attr: { points: generatePoints(true) }, onComplete: flickLogo })
}

flickLogo()
