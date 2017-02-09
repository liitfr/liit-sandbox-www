/* global $, THREE, config, requestAnimationFrame */

require('../../node_modules/three/examples/js/renderers/CanvasRenderer.js')
require('../../node_modules/three/examples/js/renderers/Projector.js')

var SEPARATION = 100
var AMOUNTX = 50
var AMOUNTY = 50
var camera
var scene
var renderer
var particles
var particle
var count = 0
var mouseX = 0
var mouseY = 0
var windowHalfX = window.innerWidth / 2
var windowHalfY = window.innerHeight / 2

function init () {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 1000
  scene = new THREE.Scene()
  particles = []
  var PI2 = Math.PI * 2
  var material = new THREE.SpriteCanvasMaterial({
    color: 0xffffff,
    program: function (context) {
      context.beginPath()
      context.arc(0, 0, 0.5, 0, PI2, true)
      context.fill()
    }
  })
  var i = 0
  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      particle = particles[ i++ ] = new THREE.Sprite(material)
      particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2)
      particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2)
      scene.add(particle)
    }
  }
  renderer = new THREE.CanvasRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  $('.waves').append(renderer.domElement)
  document.addEventListener('mousemove', onDocumentMouseMove, false)
  document.addEventListener('touchstart', onDocumentTouchStart, false)
  document.addEventListener('touchmove', onDocumentTouchMove, false)
  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize () {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseMove (event) {
  mouseX = event.clientX - windowHalfX
  mouseY = event.clientY - windowHalfY
}

function onDocumentTouchStart (event) {
  if (event.touches.length === 1) {
    mouseX = event.touches[ 0 ].pageX - windowHalfX
    mouseY = event.touches[ 0 ].pageY - windowHalfY
  }
}

function onDocumentTouchMove (event) {
  if (event.touches.length === 1) {
    mouseX = event.touches[ 0 ].pageX - windowHalfX
    mouseY = event.touches[ 0 ].pageY - windowHalfY
  }
}

function animate () {
  requestAnimationFrame(animate)
  render()
}

function render () {
  camera.position.x += (mouseX - camera.position.x) * 0.05
  camera.position.y += (-mouseY - camera.position.y) * 0.05
  camera.lookAt(scene.position)
  var i = 0
  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      particle = particles[ i++ ]
      particle.position.y = (Math.sin((ix + count) * 0.3) * 50) +
        (Math.sin((iy + count) * 0.5) * 50)
      particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 4 +
        (Math.sin((iy + count) * 0.5) + 1) * 4
    }
  }
  renderer.render(scene, camera)
  count += 0.1
}

function onReload () {
  $('.waves').append(renderer.domElement)
}

init()
animate()

window[config.spAppName] = Object.assign(
  {waves: {
    onReload: onReload
  }},
  window[config.spAppName]
)
