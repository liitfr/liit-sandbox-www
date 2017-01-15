const FastClick = require('fastclick')
const LogStyle = require('log-with-style')
const plugins = require('./_plugins.js')
const router = require('./_router.js')

var log_bold   = 'font-weight: bold'
var log_italic = 'font-style: italic'
var log_title  = 'font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000'

LogStyle('%cBienvenue !', log_title)
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', log_italic, log_bold)

router.run()

$(function() {
  FastClick.attach(document.body)
})
