import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { nickBgColor } from '../lib/nick'
import Tree from '../lib/Tree'

import Message from './Message'

class ChatThread extends Component {
  render() {
    const { parentId, roomName, tree } = this.props
    const msg = parentId ? tree.get(parentId) : null
    const msgNode = msg ? <Message msgId={msg.id} roomName={roomName} /> : null
    const children = tree.childrenOf(parentId)
    const childrenNode = !!children.size ? this.renderChildren(children, msg && msg.sender.name) : null

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
      </div>
    )
  }

  renderChildren(children, parentNick) {
    if (!children) {
      return ''
    }
    const { roomName, tree } = this.props
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
          <ChatThread key={msg.id} roomName={roomName} tree={tree} parentId={msg.id} />
        )}
      </div>
    )
  }

}

ChatThread.propTypes = {
  parentId: PropTypes.string,
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state, props) {
  const { chatSwitch } = state
  const { roomName } = props
  return chatSwitch.chats.get(roomName)
}

export default connect(select)(ChatThread)
