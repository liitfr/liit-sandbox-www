/* global $, TweenMax, Modernizr, Quad, Elastic, config */

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
// Message in log

var logBold = 'font-weight: bold'
var logItalic = 'font-style: italic'
var logTitle = 'font-family: Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000'

LogStyle('%cBienvenue !', logTitle)
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', logItalic, logBold)

router.run()

$(function () {
  FastClick.attach(document.body)
})

// -----------------------------------------------------------------------------
// Navigation menu

// Found here : http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
var keys = {37: 1, 38: 1, 39: 1, 40: 1}

function preventDefault (e) {
  e = e || window.event
  if (e.preventDefault) {
    e.preventDefault()
  }
  e.returnValue = false
}

function preventDefaultForScrollKeys (e) {
  if (keys[e.keyCode]) {
    preventDefault(e)
    return false
  }
}

function disableScroll () {
  if (window.addEventListener) {
    window.addEventListener('DOMMouseScroll', preventDefault, false)
  }
  window.onwheel = preventDefault
  window.onmousewheel = document.onmousewheel = preventDefault
  window.ontouchmove = preventDefault
  document.onkeydown = preventDefaultForScrollKeys
}

function enableScroll () {
  if (window.removeEventListener) {
    window.removeEventListener('DOMMouseScroll', preventDefault, false)
  }
  window.onmousewheel = document.onmousewheel = null
  window.onwheel = null
  window.ontouchmove = null
  document.onkeydown = null
}

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
    $('header .logo').toggleClass('over-menu')
    var onEndTransitionFn = function (ev) {
      if (support.transitions) {
        if (ev.propertyName !== 'visibility') return
        this.removeEventListener(transEndEventName, onEndTransitionFn)
      }
      $('#menu').removeClass('close')
      enableScroll()
    }
    if (support.transitions) {
      document.querySelector('div#menu').addEventListener(transEndEventName, onEndTransitionFn)
    } else {
      onEndTransitionFn()
    }
  } else if (!$('#menu').hasClass('close')) {
    $('#nav-icon').toggleClass('open')
    $('header .logo').toggleClass('over-menu')
    $('#menu').addClass('open')
    disableScroll()
  }
}

$('#nav-icon, #menu a').on('click', toggleOverlay)
$('.to-home').on('click', function (ev) {
  if ($('#menu').hasClass('open')) {
    toggleOverlay()
  }
})

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

var updateInterval = 1351
var logoSize = 200
var logoSides = 40
var logoTween

function generate (random, rad) {
  var radius = (typeof rad !== 'undefined') ? rad : 100
  return 'M -5000 -5000 h 10000 v 10000 h -10000 v -10000 Z  M ' +
    Array.apply(null, { length: logoSides }).map(function (obj, index) {
      var point = generatePoint(random, logoSides - index, radius)
      return point.x + ' ' + point.y
    }).join(' L ') +
    ' Z'
}

function generatePoint (random, index, radius) {
  var logoRadius = radius
  var minRadius = radius * 0.9
  var x = 0
  var y = -logoRadius * 0.9
  if (random) {
    y = Math.ceil(minRadius + Math.random() * (logoRadius - minRadius))
  }
  var angle = Math.PI * 2 / logoSides * index
  var cos = Math.cos(angle)
  var sin = Math.sin(angle)
  var tx = Math.floor(x * cos - y * sin + logoSize / 2)
  var ty = Math.floor(x * sin + y * cos + logoSize / 2)
  return { x: tx, y: ty }
}

function flickLogo () {
  logoTween = TweenMax.to('.polylogo', updateInterval / 1000, { attr: { d: generate(true) }, onComplete: flickLogo })
}

flickLogo()

// -----------------------------------------------------------------------------
// Social Networks

var $networkButtons = $('.network-button')
var $toggleButton = $('.network-toggle-button')
var menuOpen = false
var buttonsNum = $networkButtons.length
var buttonsMid = (buttonsNum / 2)
var spacing = 75

function openShareMenu () {
  TweenMax.to($toggleButton, 0.1, {
    scaleX: 1.2,
    scaleY: 0.6,
    ease: Quad.easeOut,
    onComplete: function () {
      TweenMax.to($toggleButton, 0.8, {
        // scale: 0.6,
        scale: 1,
        ease: Elastic.easeOut,
        easeParams: [1.1, 0.6]
      })
      TweenMax.to($toggleButton.children('.network-icon'), 0.8, {
        scale: 1.4,
        ease: Elastic.easeOut,
        easeParams: [1.1, 0.6]
      })
    }
  })
  $networkButtons.each(function (i) {
    var $cur = $(this)
    // var pos=i-buttonsMid
    var pos = i
    if (pos >= 0) pos += 1
    var dist = Math.abs(pos)
    $cur.css({
      zIndex: buttonsMid - dist
    })
    TweenMax.to($cur, 1.1 * (dist), {
      y: pos * spacing,
      // scaleY: 0.6,
      scaleY: 1,
      scaleX: 1.1,
      ease: Elastic.easeOut,
      easeParams: [1.01, 0.5]
    })
    TweenMax.to($cur, 0.8, {
      delay: (0.2 * (dist)) - 0.1,
      // scale: 0.6,
      scale: 1,
      ease: Elastic.easeOut,
      easeParams: [1.1, 0.6]
    })

    TweenMax.fromTo($cur.children('.network-icon'), 0.2, {
      scale: 0
    }, {
      delay: (0.2 * dist) - 0.1,
      scale: 1,
      ease: Quad.easeInOut
    })
  })
}
function closeShareMenu () {
  TweenMax.to([$toggleButton, $toggleButton.children('.network-icon')], 1.4, {
    delay: 0.1,
    scale: 1,
    ease: Elastic.easeOut,
    easeParams: [1.1, 0.3]
  })
  $networkButtons.each(function (i) {
    var $cur = $(this)
    var pos = i - buttonsMid
    if (pos >= 0) pos += 1
    var dist = Math.abs(pos)
    $cur.css({
      zIndex: dist
    })

    TweenMax.to($cur, 0.4 + ((buttonsMid - dist) * 0.1), {
      y: 0,
      scale: 0.95,
      ease: Quad.easeInOut
    })

    TweenMax.to($cur.children('.network-icon'), 0.2, {
      scale: 0,
      ease: Quad.easeIn
    })
  })
}

function toggleShareMenu () {
  menuOpen = !menuOpen
  menuOpen ? openShareMenu() : closeShareMenu()
}

$toggleButton.on('mousedown', function () {
  toggleShareMenu()
})

// -----------------------------------------------------------------------------
// Setters

function setUpdateInterval (ui) {
  updateInterval = ui
}

function setLogoSides (ls) {
  logoSides = ls
}

function killLogoTween () {
  logoTween.kill()
}

window[config.spAppName] = Object.assign(
  {common: {
    killLogoTween: killLogoTween,
    setUpdateInterval: setUpdateInterval,
    setLogoSides: setLogoSides,
    generate: generate,
    flickLogo: flickLogo
  }},
  window[config.spAppName]
)
