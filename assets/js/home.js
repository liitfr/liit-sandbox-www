/* global TweenMax, $, config, Back */

// -----------------------------------------------------------------------------
// Hero Animation

var heroTween

function flickHero (updateInterval, logoSides) {
  heroTween = TweenMax.to('#hero .polylogo', updateInterval, { attr: { d: window[config.spAppName].common.generate(true, logoSides) }, onComplete: flickHero, onCompleteParams: [updateInterval, logoSides] })
}

flickHero(1.351, 40)

// -----------------------------------------------------------------------------
// Logo Anim when hovering

function hoverHero () {
  $('#hero .logo .background').hover(
    function (ev) {
      ev.preventDefault()
      heroTween.kill()
      $('#hero .polylogo').attr('d', window[config.spAppName].common.generate(true, 100))
      flickHero(0.07, 100)
      TweenMax.to('#hero .logo .brand', 1, {transformOrigin: '50% -100%', ease: Back.easeInOut.config(1.3), rotationZ: 90})
      TweenMax.to('#hero .logo .headlines', 1, {transformOrigin: '50% -100%', ease: Back.easeInOut.config(1.3), rotationZ: 0})
    },
    function () {
      heroTween.kill()
      $('#hero .polylogo').attr('d', window[config.spAppName].common.generate(true, 40))
      flickHero(1.351, 40)
      TweenMax.to('#hero .logo .brand', 1, {transformOrigin: '50% -100%', ease: Back.easeInOut.config(1.3), rotationZ: 0})
      TweenMax.to('#hero .logo .headlines', 1, {transformOrigin: '50% -100%', ease: Back.easeInOut.config(1.3), rotationZ: -90})
    }
  )
}

hoverHero()

// -----------------------------------------------------------------------------
// Scroll watcher

$(window).scroll(function () {
  if ($('#home').length && $(window).width() / 2 < 1023) {
    if ($(window).scrollTop() + $('#nav-icon').position().top > $('#punchline').offset().top && !$('#nav-icon').hasClass('secondary-color') ||
    $(window).scrollTop() + $('#nav-icon').position().top < $('#punchline').offset().top && $('#nav-icon').hasClass('secondary-color')) {
      $('#nav-icon').toggleClass('secondary-color')
    }
  }
})

// -----------------------------------------------------------------------------
// on leave

$('#home #menu ul').first().children().not(':first').click(function () {
  $('#nav-icon').removeClass('secondary-color')
})

$('#headlines a').click(function () {
  $('#nav-icon').removeClass('secondary-color')
})

// -----------------------------------------------------------------------------
// on reload

function onReload () {
  hoverHero()
}

window[config.spAppName] = Object.assign(
  {home: {
    onReload: onReload
  }},
  window[config.spAppName]
)
