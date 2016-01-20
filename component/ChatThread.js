import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { nickBgColor } from '../lib/nick'
import Tree from '../lib/Tree'

import Message from './Message'

class _ChatThread extends Component {
  render() {
    const { children, msg, parentId, roomName } = this.props
    const msgNode = msg ? <Message msgId={msg.id} roomName={roomName} /> : null
    const childrenNode = !!children ? this.renderChildren(children, msg && msg.sender.name) : null

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
      </div>
    )
  }

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
}

_ChatThread.propTypes = {
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
    msg
  }
}

var ChatThread = connect(select)(_ChatThread)
export default ChatThread
