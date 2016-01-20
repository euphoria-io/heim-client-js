import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { nickBgColor } from '../lib/nick'

import Message from './Message'

class _ChatThread extends Component {
  renderChildren(children, parentNick) {
    if (!children || !children.size) {
      return ''
    }
    const { roomName } = this.props
    let style = {}
    if (parentNick) {
      style = {
        ...style,
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: nickBgColor(parentNick).background,
      }
    }
    return (
      <div ref="children" className="children" style={style}>
        {children.valueSeq().map(msg =>
          <ChatThread key={msg.id} roomName={roomName} parentId={msg.id} />
        )}
      </div>
    )
  }

  render() {
    const { children, msg, roomName } = this.props
    const msgNode = msg ? <Message msgId={msg.id} roomName={roomName} /> : null
    const childrenNode = !!children ? this.renderChildren(children, msg && msg.sender.name) : null

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
      </div>
    )
  }
}

_ChatThread.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  msg: PropTypes.object,
  parentId: PropTypes.string,
  roomName: PropTypes.string.isRequired,
}

function select(state, props) {
  const { parentId, roomName } = props
  const chat = state.chatSwitch.chats.get(roomName)
  const msg = parentId ? chat.tree.get(parentId) : null
  const children = chat.tree.childrenOf(parentId)
  return {
    children,
    msg,
  }
}

const ChatThread = connect(select)(_ChatThread)
export default ChatThread
