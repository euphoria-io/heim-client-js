import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { nickBgColor, nickBgLightColor } from '../lib/nick'

import Nick from './Nick'
import UserText from './UserText'

class Message extends Component {
  render() {
    const { hasChildren, msg, now } = this.props
    let messageStyle = {}
    if (hasChildren) {
      messageStyle = {
        ...messageStyle,
        borderTopLeftRadius: '0.3rem',
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: nickBgColor(msg.sender.name).background,
      }
    }

    const emote = msg.content.startsWith('/me ')
    const className = emote ? 'message emote' : 'message'
    const content = emote ? msg.content.substr(4) : msg.content
    const contentStyle = emote ? nickBgLightColor(msg.sender.name) : null
    return (
      <div className={className} style={messageStyle}>
        <div className="sender">
          <Nick name={msg.sender.name} withThreadLine={hasChildren} />
        </div>
        <div className="content-and-time">
          <UserText
            autolink
            className="content"
            style={contentStyle}
            content={content}
            timestamp={moment.unix(msg.time)}
            now={now}
          />
        </div>
      </div>
    )
  }
}

Message.mixins = [PureRenderMixin]

Message.propTypes = {
  hasChildren: PropTypes.bool,
  msg: PropTypes.object,
  now: PropTypes.instanceOf(Date),
}

export default Message
