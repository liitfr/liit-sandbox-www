var logoCenter = 100
var logoSides = 40

function generate (random, radius, offset) {
  var offset = (typeof offset !== 'undefined') ? offset : {x: 0, y: 0}
  var radius = (typeof radius !== 'undefined') ? radius : 100
  return 'M ' + Array.apply(null, { length: logoSides }).map(function (obj, index) {
    var point = generatePoint(random, index, radius)
    point.x += offset.x
    point.y += offset.y
    return point.x + ' ' + point.y
  }).reverse().join(' L') + ' Z'
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
  var tx = x * cos - y * sin + logoCenter
  var ty = x * sin + y * cos + logoCenter
  return { x: tx, y: ty }
}

module.exports = {
  generate: generate
}
