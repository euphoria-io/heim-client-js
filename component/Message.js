import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { nickBgColor, nickBgLightColor } from '../lib/nick'

import Timestamp from './Timestamp'
import UserText from './UserText'

class Message extends Component {
  render() {
    const { hasChildren, msg, now } = this.props
    let messageStyle = {}
    let nickStyle = nickBgColor(msg.sender.name)
    if (!!hasChildren) {
      nickStyle = {
        ...nickStyle,
        borderBottomLeftRadius: 0,
      }
      messageStyle = {
        ...messageStyle,
        borderTopLeftRadius: '0.3rem',
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: nickStyle.background,
      }
    }

    const emote = msg.content.startsWith('/me ')
    const className = emote ? 'message emote' : 'message'
    const content = emote ? msg.content.substr(4) : msg.content
    const contentStyle = emote ? nickBgLightColor(msg.sender.name) : null
    return (
      <div className={className} style={messageStyle}>
        <div className="sender">
          <UserText className="nick" style={nickStyle}>{msg.sender.name}</UserText>
        </div>
        <div className="content-and-time">
          <UserText className="content" style={contentStyle}>{content}</UserText>
          <Timestamp at={moment.unix(msg.time)} now={now} />
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
