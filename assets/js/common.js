/* global $, TweenMax, Modernizr, config, Back */

require('offline-plugin/runtime').install()

require('EasePack')
const FastClick = require('fastclick')
const LogStyle = require('log-with-style')
const router = require('./_router.js')
require('ScrollToPlugin')
require('TweenMax')

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
// Router

router.run()

// -----------------------------------------------------------------------------
// Message in log

var logBold = 'font-weight: bold'
var logItalic = 'font-style: italic'
var logTitle = 'font-family: Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000'

LogStyle('%cBienvenue !', logTitle)
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', logItalic, logBold)

// -----------------------------------------------------------------------------
// Fast click

$(function () {
  FastClick.attach(document.body)
})

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
  if ($('#menu').hasClass('open')) {
    $('#menu').removeClass('open')
    $('#menu').addClass('close')
    $('#nav-icon').toggleClass('open')
    $('header').toggleClass('over-menu')
    var onEndTransitionFn = function (ev) {
      if (support.transitions) {
        if (ev.propertyName !== 'visibility') return
        this.removeEventListener(transEndEventName, onEndTransitionFn)
      }
      $('#menu').removeClass('close')
    }
    if (support.transitions) {
      document.querySelector('div#menu').addEventListener(transEndEventName, onEndTransitionFn)
    } else {
      onEndTransitionFn()
    }
  } else if (!$('#menu').hasClass('close')) {
    $('#nav-icon').toggleClass('open')
    $('header').toggleClass('over-menu')
    $('#menu').addClass('open')
    TweenMax.staggerFromTo('#menu ul:nth-child(1) li', 0.7, {autoAlpha: 0, x: -300}, {autoAlpha: 1, x: 0, ease: Back.easeOut.config(0)}, 0.03)
    TweenMax.staggerFromTo('#menu ul:nth-child(2) li', 0.7, {autoAlpha: 0, y: 200}, {autoAlpha: 1, y: 0, ease: Back.easeOut.config(1.4)}, 0.05)
  }
}

// Hide menu if user doesn't click on any logo, link or button
$('#menu, header').on('click', function (event) {
  if ($('#menu').hasClass('open')) {
    toggleOverlay()
  }
})

// Exception for nav-icon click
$('#nav-icon').on('click', function (ev) {
  ev.stopPropagation()
  toggleOverlay()
})

// Exception for Social Network button
$('#menu ul:nth-child(2) li:nth-child(3)').on('click', function (ev) {
  ev.stopPropagation()
})

// If user clicks on any link, hide menu
$('#menu a').on('click', toggleOverlay)

// If user clicks on "to home" logo and menu is open, hide it
$('.to-home').on('click', function (ev) {
  if ($('#menu').hasClass('open')) {
    toggleOverlay()
  }
})

// Hide menu if user press ESC
window.addEventListener('keydown', function (event) {
  if (event.defaultPrevented) {
    return
  }
  switch (event.key) {
    case 'Escape':
      if ($('#menu').hasClass('open')) {
        toggleOverlay()
      }
      break
    default:
      return
  }
  event.preventDefault()
}, true)

// -----------------------------------------------------------------------------
// logo animation

var updateInterval = 1.351
var logoSize = 200
var radius = 100

function generate (mask, logoSides) {
  return (mask ? 'M -5000 -5000 h 10000 v 10000 h -10000 v -10000 Z  M ' : 'M ') +
    Array.apply(null, { length: logoSides }).map(function (obj, index) {
      var point = generatePoint(logoSides - index, logoSides)
      return point.x + ' ' + point.y
    }).join(' L ') +
    ' Z'
}

function generatePoint (index, logoSides) {
  var logoRadius = radius
  var minRadius = radius * 0.9
  var x = 0
  // Non random
  // var y = -logoRadius * 0.9
  var y = Math.ceil(minRadius + Math.random() * (logoRadius - minRadius))
  var angle = Math.PI * 2 / logoSides * index
  var cos = Math.cos(angle)
  var sin = Math.sin(angle)
  var tx = Math.floor(x * cos - y * sin + logoSize / 2)
  var ty = Math.floor(x * sin + y * cos + logoSize / 2)
  return { x: tx, y: ty }
}

function flickLogo () {
  TweenMax.to('header .polylogo', updateInterval, { attr: { d: generate(false, 40) }, onComplete: flickLogo })
}

flickLogo()

// -----------------------------------------------------------------------------

window[config.spAppName] = Object.assign(
  {common: {
    generate: generate
  }},
  window[config.spAppName]
)
