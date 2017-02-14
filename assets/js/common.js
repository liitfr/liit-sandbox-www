/* global $, TweenLite, Modernizr */

// TODO : utiliser xPercent gsap !
// TODO : trigger toggle des deux icones
// TODO : trigger colors menu + icone

const FastClick = require('fastclick')
const generatePath = require('./_generatePath.js')
const LogStyle = require('log-with-style')
const router = require('./_router.js')
require('TweenMax')
require('ScrollToPlugin')

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
  if ($('.menu').hasClass('open')) {
    $('.menu').removeClass('open')
    $('.menu').addClass('close')
    $('#nav-icon').toggleClass('open')
    $('header').toggleClass('transparent')
    var onEndTransitionFn = function (ev) {
      if (support.transitions) {
        if (ev.propertyName !== 'visibility') return
        // BUG : jQuery doesn't return same event as vanilla addEventListener
        // this.off(transEndEventName, onEndTransitionFn)
        this.removeEventListener(transEndEventName, onEndTransitionFn)
      }
      $('.menu').removeClass('close')
    }
    if (support.transitions) {
      // BUG : jQuery doesn't return same event as vanilla addEventListener
      // $('.menu').on(transEndEventName, onEndTransitionFn)
      document.querySelector('div.menu').addEventListener(transEndEventName, onEndTransitionFn)
    } else {
      onEndTransitionFn()
    }
  } else if (!$('.menu').hasClass('close')) {
    $('#nav-icon').toggleClass('open')
    $('header').toggleClass('transparent')
    $('.menu').addClass('open')
  }
}

$('#nav-icon, .menu a').on('click', toggleOverlay)
$('#logo-banner').on('click', function (ev) {
  if ($('.menu').hasClass('open')) {
    toggleOverlay()
  }
  if ($('#home').length) {
    ev.preventDefault()
    TweenLite.to(window, 1, {scrollTo: 0})
  }
})

window.addEventListener('keydown', function (event) {
  if (event.defaultPrevented) {
    return
  }
  switch (event.key) {
    case 'Escape':
      if ($('.menu').hasClass('open')) {
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

var updateInterval = 1351

function flickLogo () {
  TweenLite.to('.polylogo', updateInterval / 1000, { attr: { d: generatePath.generate(true) }, onComplete: flickLogo })
}

flickLogo()
