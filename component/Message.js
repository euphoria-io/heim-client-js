import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { nickBgColor, nickBgLightColor } from '../lib/nick'

import Timestamp from './Timestamp'
import UserText from './UserText'

class Message extends Component {
  render() {
    const { hasChildren, msg } = this.props
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
          <Timestamp at={moment.unix(msg.time)} />
        </div>
      </div>
    )
  }
}

Message.propTypes = {
  msgId: PropTypes.string.isRequired,
  roomName: PropTypes.string.isRequired,
}

function select(state, props) {
  const { msgId, roomName } = props
  const chat = state.chatSwitch.chats.get(roomName)
  return {
    hasChildren: chat.tree.hasChildren(msgId),
    msg: chat.tree.get(msgId),
  }
}

export default connect(select)(Message)
