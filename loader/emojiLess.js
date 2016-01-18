import _ from 'lodash'
import fs from 'fs'
import path from 'path'

import emoji from '../lib/emoji'

module.exports = function(source) {
  this.cacheable()
  var cb = this.async()

  const output = _.map(emoji.codes, code => {
    if (!code) {
      return ''
    }
    const twemojiPath = path.dirname(require.resolve('twemoji')) + '/svg/'
    const twemojiName = code.replace(/^0*/, '')
    let emojiPath = '../res/emoji/' + twemojiName + '.svg'
    if (!fs.existsSync(emojiPath)) {
      emojiPath = twemojiPath + twemojiName + '.svg'
    }
    return `.emoji-${code} { background-image: data-uri("${emojiPath}") }`
  }).join('\n')
  cb(null, output)
}
