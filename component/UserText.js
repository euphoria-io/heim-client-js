import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import twemoji from 'twemoji'

import emoji from '../lib/emoji'

class UserText extends Component {
  render() {
    let html = _.escape(this.props.content)
    html = html.replace(emoji.namesRe, (match, name) =>
      ReactDOMServer.renderToStaticMarkup(
        <div className={'emoji emoji-' + emoji.index[name]} title={match}>{match}</div>
      )
    )
    html = twemoji.replace(html, (match, icon, variant) => {
      if (variant === '\uFE0E') {
        return match
      }
      const codePoint = emoji.lookupEmojiCharacter(icon)
      if (!codePoint) {
        return match
      }
      const emojiName = emoji.names[codePoint] && ':' + emoji.names[codePoint] + ':'
      return ReactDOMServer.renderToStaticMarkup(
        <div className={'emoji emoji-' + codePoint} title={emojiName}>{icon}</div>
      )
    })

    return (
      <span className="user-text" dangerouslySetInnerHTML={{__html: html}} />
    )
  }
}

UserText.propTypes = {
  content: PropTypes.string.isRequired,
}

export default UserText
