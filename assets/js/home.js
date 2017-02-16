// TODO : cacher les background avant le premier scroll sur portable

/* global $, config, ScrollMagic, TweenMax */

// require('./_contactform.js')
const generatePath = require('./_generatePath.js')

// -----------------------------------------------------------------------------
// Avoid `page jumps` on mobiles, because of adress bar

// http://detectmobilebrowsers.com
var isMobile = (function (a) { return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera)

function staticifyHeight () {
  $('#home .part').height(
    window.innerHeight * 2 < $('#home .part').css('min-height').replace('px', '')
    ? $('#home .part').css('min-height').replace('px', '')
    : ($('#home .part').height(
        window.innerHeight * 2 > $('#home .part').css('max-height').replace('px', '')
        ? $('#home .part').css('max-height').replace('px', '')
        : window.innerHeight * 2
    ))
  )
}

if (isMobile) {
  $(window).on('orientationchange', function (event) {
    staticifyHeight()
  })
  staticifyHeight()
}

// -----------------------------------------------------------------------------
// Home background creation

var offsetSize = 300
var maxX = 13
var minX = -6
var maxY = 9
var minY = -2

if (isMobile) {
  maxY = 25
  minY = -4
}

for (var x = minX; x < maxX; x++) {
  for (var y = minY; y < maxY; y++) {
    if (x !== 0 || y !== 0) {
      var offset = {
        x: x * offsetSize,
        y: y * offsetSize
      }
      $('#logo-fat #background').attr('d', $('#logo-fat #background').attr('d') + ' ' + generatePath.generate(true, 100, offset))
    }
  }
}

$('#logo').html($('#logo').html())

// -----------------------------------------------------------------------------
// intro animation with scrolling

function defineDuration () {
  return '100%'
}

var tweenMoveLogo = TweenMax.to('#logo-fat', 5,
  {
    left: $('#logo-banner .polylogo').position().left + $('#logo-banner').width() / 2,
    top: $('#logo-banner .polylogo').position().top + $('#logo-banner').height() / 2 - $(window).scrollTop(),
    width: $('#logo-banner').innerWidth()
  }
)

var smController = new ScrollMagic.Controller()

var sceneMoveLogo = new ScrollMagic.Scene({
  triggerElement: '#trigger-1',
  duration: defineDuration()
})
  .setTween(tweenMoveLogo)
  .addTo(smController)
  .on('end', function (event) {
    $('#logo-banner, #logo-fat text').toggleClass('show')
  })

var tweenAura = TweenMax.to('#aura', 5, {scale: 50})
var sceneAura = new ScrollMagic.Scene({
  triggerElement: '#trigger-1',
  duration: defineDuration()
})
  .setTween(tweenAura)
  .addTo(smController)

var sceneStaticIntro = new ScrollMagic.Scene({
  triggerElement: '#trigger-1',
  duration: defineDuration()
})
  .setPin('#intro')
  .addTo(smController)

$(window).resize(function () {
  TweenMax.killTweensOf('#logo-fat')
  $('#logo-fat').removeAttr('style')
  tweenMoveLogo = TweenMax.to('#logo-fat', 5,
    {
      left: $('#logo-banner .polylogo').position().left + $('#logo-banner').width() / 2 + $('#logo-banner').css('marginLeft').replace('px', ''),
      top: $('#logo-banner .polylogo').position().top + $('#logo-banner').height() / 2 - $(window).scrollTop() + $('#logo-banner').css('marginTop').replace('px', ''),
      width: $('#logo-banner').innerWidth()
    }
  )
  sceneMoveLogo.setTween(tweenMoveLogo)
  sceneMoveLogo.duration(defineDuration())
  sceneStaticIntro.duration(defineDuration())
  sceneAura.duration(defineDuration())
})

new ScrollMagic.Scene({
  triggerElement: '.second',
  triggerPosition: 0,
  triggerHook: 0.10,
  duration: 0.01
})
  .setTween(TweenMax.to('#logo-banner .polylogo', 0.5, {fill: '#FFF'}))
  .addTo(smController)

$('.part').not('.first').each(function (idx, ele) {
  new ScrollMagic.Scene({
    triggerElement: ele,
    triggerPosition: 0,
    triggerHook: 0.10,
    duration: 0.01
  })
    .setTween(TweenMax.to('#logo-banner text', 0.5, {fill: $(ele).css('background')}))
    .addTo(smController)
})

function onReload () {

}

window[config.spAppName] = Object.assign(
  {home: {
    onReload: onReload
  }},
  window[config.spAppName]
)
