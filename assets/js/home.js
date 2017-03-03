/* global ScrollMagic, TweenMax, Cubic, $, Power0, config, Back */

// -----------------------------------------------------------------------------
// Scrolling Effect

var tweenMoveLogo
var tweenResizeHero
var scMoveLogo
var scResizeHero
var smController

function scrollSupport () {
  smController = new ScrollMagic.Controller()
    .scrollTo(function (target) {
      TweenMax.to(window, 0.5, {
        scrollTo: {
          y: target,
          autoKill: true
        },
        ease: Cubic.easeInOut
      })
    })

  tweenMoveLogo = TweenMax.to('#hero .to-home', 2, {
    left: $('#home .to-home').offset().left + ($('#home .to-home').width() / 2),
    width: $('#home .to-home').width(), ease: Power0.easeNone
  })
  tweenResizeHero = TweenMax.to('#hero', 2, {height: $('header').height(), ease: Power0.easeNone})

  scResizeHero = new ScrollMagic.Scene({
    duration: $('#hero').height() - $('header').height()
  })
    .setTween(tweenResizeHero)
    .addTo(smController)

  scMoveLogo = new ScrollMagic.Scene({
    duration: $('#hero').height() - $('header').height()
  })
    .setTween(tweenMoveLogo)
    .addTo(smController)

}

scrollSupport()

// -----------------------------------------------------------------------------
// Logo Anim when hovering

function hoverHero () {
  TweenMax.set('#hero .logo .headlines', {transformOrigin: '100px -1000px', rotationZ: '-90'})
  TweenMax.set('#hero .logo .headlines', {autoAlpha: 1})
  $('#hero .to-home.anim-enabled').hover(
    function () {
      window[config.spAppName].common.killLogoTween()
      window[config.spAppName].common.setUpdateInterval(50)
      window[config.spAppName].common.setLogoSides(100)
      $('.polylogo').attr('d', window[config.spAppName].common.generate(true))
      window[config.spAppName].common.flickLogo()
      TweenMax.to('#hero .logo .brand', 1, {transformOrigin: '100px -1000px', ease: Back.easeInOut.config(1.3), rotationZ: 90})
      TweenMax.to('#hero .logo .headlines', 1, {transformOrigin: '100px -1000px', ease: Back.easeInOut.config(1.3), rotationZ: 0})
    },
    function () {
      window[config.spAppName].common.killLogoTween()
      window[config.spAppName].common.setUpdateInterval(1351)
      window[config.spAppName].common.setLogoSides(40)
      $('.polylogo').attr('d', window[config.spAppName].common.generate(true))
      window[config.spAppName].common.flickLogo()
      TweenMax.to('#hero .logo .brand', 1, {transformOrigin: '100px -1000px', ease: Back.easeInOut.config(1.3), rotationZ: 0})
      TweenMax.to('#hero .logo .headlines', 1, {transformOrigin: '100px -1000px', ease: Back.easeInOut.config(1.3), rotationZ: -90})
    }
  )
}

hoverHero()

// -----------------------------------------------------------------------------
// ScrollTo Anim

function scrollToAnim () {
  $('#hero .to-home, header .to-home').on('click', function (ev) {
    if ($('#home').length) {
      ev.preventDefault()
      smController.scrollTo(0)
    }
  })
}

scrollToAnim()

// -----------------------------------------------------------------------------
// Window resize

$(window).resize(function () {
  if ($('#home').length) {
    tweenMoveLogo.kill()
    $('#hero .to-home').removeAttr('style')
    tweenMoveLogo = TweenMax.to('#hero .to-home', 2, {left: $('#home header .to-home').offset().left, ease: Power0.easeNone})
    scMoveLogo.setTween(tweenMoveLogo)
    tweenResizeHero.kill()
    $('#hero').removeAttr('style')
    tweenResizeHero = TweenMax.to('#hero', 2, {height: $('header').height(), ease: Power0.easeNone})
    scResizeHero.setTween(tweenResizeHero)
  }
})

// -----------------------------------------------------------------------------
// on reload

function onReload () {
  scrollSupport()
  hoverHero()
  scrollToAnim()
}

window[config.spAppName] = Object.assign(
  {home: {
    onReload: onReload
  }},
  window[config.spAppName]
)
