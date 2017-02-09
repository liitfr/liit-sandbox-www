/* global $, TweenLite, Modernizr */

require('../../node_modules/gsap/AttrPlugin.js')

const FastClick = require('fastclick')
const LogStyle = require('log-with-style')
const router = require('./_router.js')

// -----------------------------------------------------------------------------

// Avoid `console` errors in browsers that lack a console.
var method
var noop = () => {}
var methods = [
  'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
  'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
  'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
  'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
]
var length = methods.length
var console = (window.console = window.console || {})

while (length--) {
  method = methods[length]

  // Only stub undefined methods.
  if (!console[method]) {
    console[method] = noop
  }
}

// -----------------------------------------------------------------------------

// Message in log
var logBold = 'font-weight: bold'
var logItalic = 'font-style: italic'
var logTitle = 'font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000'

LogStyle('%cBienvenue !', logTitle)
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', logItalic, logBold)

router.run()

$(function () {
  FastClick.attach(document.body)
})

// -----------------------------------------------------------------------------

// logo animation
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
  if (random) {
    y = Math.ceil(minRadius + Math.random() * (logoRadius - minRadius))
  }
  var angle = Math.PI * 2 / logoSides * index
  var cos = Math.cos(angle)
  var sin = Math.sin(angle)
  var tx = x * cos - y * sin + logoCenter
  var ty = x * sin + y * cos + logoCenter
  return { x: tx, y: ty }
}

function flickLogo () {
  TweenLite.to('#logo-liit polygon', updateInterval / 1000, { attr: { points: generatePoints(true) }, onComplete: flickLogo })
}

flickLogo()

// -----------------------------------------------------------------------------

// Navigation menu
var support = { transitions: Modernizr.csstransitions }
var transEndEventNames = {
  'WebkitTransition': 'webkitTransitionEnd',
  'MozTransition': 'transitionend',
  'OTransition': 'oTransitionEnd',
  'msTransition': 'MSTransitionEnd',
  'transition': 'transitionend'
}
var transEndEventName = transEndEventNames[Modernizr.prefixed('transition')]

function toggleOverlay () {
  if ($('.overlay').hasClass('open')) {
    $('.overlay').removeClass('open')
    $('.overlay').addClass('close')
    $('#nav-icon').toggleClass('open')
    $('header').toggleClass('transparent')
    var onEndTransitionFn = function (ev) {
      if (support.transitions) {
        if (ev.propertyName !== 'visibility') return
        // this.off(transEndEventName, onEndTransitionFn)
        this.removeEventListener( transEndEventName, onEndTransitionFn )
      }
      $('.overlay').removeClass('close')
    }
    if (support.transitions) {
      // BUG : jQuery doesn't return same event as vanilla addEventListener
      // $('.overlay').on(transEndEventName, onEndTransitionFn)
      document.querySelector('div.overlay').addEventListener(transEndEventName, onEndTransitionFn)
    } else {
      onEndTransitionFn()
    }
  } else if (!$('.overlay').hasClass('close')) {
    $('#nav-icon').toggleClass('open')
    $('header').toggleClass('transparent')
    $('.overlay').addClass('open')
  }
}

$('#nav-icon').on('click', toggleOverlay)
$('#logo-liit').on('click',function () {
  if ($('.overlay').hasClass('open')) {
    toggleOverlay()
  }
})
$('.overlay a').on('click', toggleOverlay)
