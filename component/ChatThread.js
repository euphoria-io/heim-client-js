import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { nickBgColor, nickBgLightColor } from '../lib/nick'
import Tree from '../lib/Tree'

import Timestamp from './Timestamp'

class ChatThread extends Component {
  render() {
    const { tree, parentId } = this.props
    const msg = parentId ? tree.nodes.get(parentId) : null
    const children = tree.childrenOf(parentId)
    const msgNode = this.renderMessage(msg)
    const childrenNode = !!children.size ? this.renderChildren(children) : null

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
      </div>
    )
  }

  renderMessage(msg) {
    if (!msg) {
      return ''
    }
    const emote = msg.content.startsWith('/me ')
    const className = emote ? 'message emote' : 'message'
    const content = emote ? msg.content.substr(4) : msg.content
    const contentStyle = emote ? nickBgLightColor(msg.sender.name) : null
    return (
      <div className={className}>
        <div className="nick" style={nickBgColor(msg.sender.name)}>{msg.sender.name}</div>
        <div className="content-and-time">
          <div className="content" style={contentStyle}>{content}</div>
          <Timestamp at={moment.unix(msg.time)} />
        </div>
      </div>
    )
  }

  renderChildren(children) {
    if (!children) {
      return ''
    }
    const { roomName, tree } = this.props
    return (
      <div ref="children" className="children">
        {children.map(msgId =>
          <ChatThread key={msgId} roomName={roomName} tree={tree} parentId={msgId} />
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
