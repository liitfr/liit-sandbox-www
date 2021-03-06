/* global $, Modernizr */

/**
 * "loading" effects for grids from/based on: http://tympanus.net/codrops/2013/07/02/loading-effects-for-grid-items-with-css-animations/ (Check it out for more examples and effects)
 *
 * animOnScroll.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */

var docElem = window.document.documentElement

// some helper functions
function scrollY () { return window.pageYOffset || docElem.scrollTop }

function getViewportH () {
  var client = docElem['clientHeight']
  var inner = window['innerHeight']

  if (client < inner) {
    return inner
  } else {
    return client
  }
}

 // http://stackoverflow.com/a/5598797/989439
function getOffset (elem) {
  var box = elem.getBoundingClientRect()
  var body = document.body
  var docEl = document.documentElement
  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft
  var clientTop = docEl.clientTop || body.clientTop || 0
  var clientLeft = docEl.clientLeft || body.clientLeft || 0
  var top = box.top + scrollTop - clientTop
  var left = box.left + scrollLeft - clientLeft
  return { top: Math.round(top), left: Math.round(left) }
}

function inViewport (el, pH) {
  var elH = el.offsetHeight
  var scrolled = scrollY()
  var viewed = scrolled + getViewportH()
  var elTop = getOffset(el).top
  // var elBottom = elTop + elH
  // if 0, the element is considered in the viewport as soon as it enters.
  // if 1, the element is considered in the viewport only when it's fully inside
  // value in percentage (1 >= h >= 0)
  var h = pH || 0

  return (elTop + elH * h) <= viewed// && (elBottom - elH * h) >= scrolled
}

function extend (a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key]
    }
  }
  return a
}

var support = { animations: Modernizr.cssanimations }
var animEndEventNames = { 'WebkitAnimation': 'webkitAnimationEnd', 'OAnimation': 'oAnimationEnd', 'msAnimation': 'MSAnimationEnd', 'animation': 'animationend' }
var animEndEventName = animEndEventNames[ Modernizr.prefixed('animation') ]
var onEndAnimation = function (el, callback) {
  var onEndCallbackFn = function (ev) {
    if (support.animations) {
      if (ev.target !== this) return
      this.removeEventListener(animEndEventName, onEndCallbackFn)
    }
    if (callback && typeof callback === 'function') { callback.call() }
  }
  if (support.animations) {
    el.addEventListener(animEndEventName, onEndCallbackFn)
  } else {
    onEndCallbackFn()
  }
}

function AnimOnScroll (el, options) {
  this.el = el
  this.options = extend(this.defaults, options)
  this._init()
}

AnimOnScroll.prototype = {
  defaults: {
    // Minimum and a maximum duration of the animation (a random value is chosen)
    minDuration: 0,
    maxDuration: 0,
    // The viewportFactor defines how much of the item has to be visible in order to trigger the animation
    // if we'd use a value of 0, this would mean that it would trigger the animation as soon as the item is in the viewport.
    // If we were to use the value of 1, the animation would only be triggered when we see all of the item inside the viewport.
    viewportFactor: 0.2
  },
  _init: function () {
    var self = this

    this.items = [].slice.call(this.el.children)
    this.itemsCount = this.items.length
    this.itemsRenderedCount = 0
    this.didScroll = false

    // the items already shown...
    this.items.forEach(function (el, i) {
      if (inViewport(el)) {
        self._checkTotalRendered()
        $(el).addClass('shown')
      }
    })

    // animate the items inside the viewport on scroll
    window.addEventListener('scroll', function () {
      self._onScrollFn()
    }, false)
    window.addEventListener('resize', function () {
      self._resizeHandler()
    }, false)
  },
  _onScrollFn: function () {
    var self = this
    if (!this.didScroll) {
      this.didScroll = true
      setTimeout(function () { self._scrollPage() }, 60)
    }
  },
  _scrollPage: function () {
    var self = this
    this.items.forEach(function (el, i) {
      if (!$(el).hasClass('shown') && !$(el).hasClass('animate') && inViewport(el, self.options.viewportFactor)) {
        setTimeout(function () {
          self._checkTotalRendered()

          if (self.options.minDuration && self.options.maxDuration) {
            var randDuration = (Math.random() * (self.options.maxDuration - self.options.minDuration) + self.options.minDuration) + 's'
            el.style.WebkitAnimationDuration = randDuration
            el.style.MozAnimationDuration = randDuration
            el.style.animationDuration = randDuration
          }

          $(el).addClass('animate')
          onEndAnimation(el, function () {
            $(el).addClass('shown')
            $(el).removeClass('animate')
          })
        }, 25)
      }
    })
    this.didScroll = false
  },
  _resizeHandler: function () {
    var self = this
    function delayed () {
      self._scrollPage()
      self.resizeTimeout = null
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    this.resizeTimeout = setTimeout(delayed, 100)
  },
  _checkTotalRendered: function () {
    ++this.itemsRenderedCount
    if (this.itemsRenderedCount === this.itemsCount) {
      window.removeEventListener('scroll', this._onScrollFn)
    }
  }
}

// -----------------------------------------------------------------------------

module.exports = {
  AnimOnScroll: AnimOnScroll
}
