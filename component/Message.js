import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { MOVE_CURSOR } from '../const'

import { nickBgColor, nickBgLightColor } from '../lib/nick'

import Nick from './Nick'
import UserText from './UserText'

class Message extends Component {
  render() {
    const { dispatch, hasChildren, msg, now, roomName, terminal } = this.props

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

    const emote = msg.content.startsWith('/me ') && msg.content.length < 240
    const className = emote ? 'message emote' : 'message'
    const content = emote ? msg.content.substr(4) : msg.content
    const contentStyle = emote ? nickBgLightColor(msg.sender.name) : null
    const onClick = () => {
      dispatch({
        type: MOVE_CURSOR,
        roomName,
        msgId: msg.id,
      })
    }

    return (
      <div className={className} style={messageStyle} onClick={onClick}>
        <div className="sender">
          <Nick name={msg.sender.name} withThreadLine={hasChildren} />
        </div>
        <div className="content-and-time">
          <UserText
            autolink
            className="content"
            style={contentStyle}
            content={content}
            timestamp={terminal && moment.unix(msg.time)}
            now={now}
          />
        </div>
      </div>
    )
  }
}

Message.mixins = [PureRenderMixin]

Message.propTypes = {
  dispatch: PropTypes.func.isRequired,
  hasChildren: PropTypes.bool,
  msg: PropTypes.object,
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string.isRequired,
  terminal: PropTypes.bool,
}

export default Message
