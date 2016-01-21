import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import twemoji from 'twemoji'

import emoji from '../lib/emoji'

class UserText extends Component {
  render() {
    let html = _.escape(this.props.children)

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

    let props = this.props
    props = {
      ...props,
      className: props.className || 'user-text',
    }
    delete(props.children)
    return (
      <div {...props} dangerouslySetInnerHTML={{ __html: html }} />
    )
  }
}

UserText.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.string,
  ]).isRequired,
}

export default UserText
