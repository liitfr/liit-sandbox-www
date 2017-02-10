/* global $, TweenMax, Modernizr */

require('animation.gsap')
const FastClick = require('fastclick')
const LogStyle = require('log-with-style')
const router = require('./_router.js')
const ScrollMagic = require('ScrollMagic')

// -----------------------------------------------------------------------------

// Avoid `console` errors in browsers that lack a console.
var method
var noop = function () {}
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
  TweenMax.to('#logo-liit polygon', updateInterval / 1000, { attr: { points: generatePoints(true) }, onComplete: flickLogo })
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
        // BUG : jQuery doesn't return same event as vanilla addEventListener
        // this.off(transEndEventName, onEndTransitionFn)
        this.removeEventListener(transEndEventName, onEndTransitionFn)
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

$('#nav-icon, .overlay a').on('click', toggleOverlay)
$('#logo-liit').on('click', function (ev) {
  if ($('.overlay').hasClass('open')) {
    toggleOverlay()
  }
  if ($('#home').length) {
    ev.preventDefault()
    TweenMax.to(window, 1, {scrollTo: 0})
  }
})

window.addEventListener('keydown', function (event) {
  if (event.defaultPrevented) {
    return
  }
  switch (event.key) {
    case 'Escape':
      if ($('.overlay').hasClass('open')) {
        toggleOverlay()
      }
      break
    default:
      return
  }
  event.preventDefault()
}, true)

// -----------------------------------------------------------------------------

// Home animations
var smController = new ScrollMagic.Controller()
new ScrollMagic.Scene({
  triggerElement: '#anim-logo',
  duration: 100
})
  .setTween(TweenMax.to('#logo-liit', 0.5, {x: 100}))
  .addTo(smController)
