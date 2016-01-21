import _ from 'lodash'
import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import twemoji from 'twemoji'

import emoji from '../lib/emoji'

import Timestamp from './Timestamp'

function isMoment(prop, propName) {
  if (!moment.isMoment(prop[propName])) {
    return new Error('not a Moment instance')
  }
}

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

    const { now, timestamp } = this.props
    if (timestamp) {
      html += ReactDOMServer.renderToStaticMarkup(
        <Timestamp at={timestamp} now={now} />
      )
    }

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
  content: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.number, isMoment]).isRequired,
  now: PropTypes.instanceOf(Date),
}

export default UserText
