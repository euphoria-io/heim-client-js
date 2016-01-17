import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { nickFgColor } from '../lib/nick'
import ScrollFollower from '../lib/ScrollFollower'
import Tree from '../lib/Tree'

import Timestamp from './Timestamp'

class ChatThread extends Component {
  render() {
    const { tree, parentId } = this.props
    const msg = parentId ? tree.nodes.get(parentId) : null
    const children = tree.childrenOf(parentId)
    const msgNode = this.renderMessage(msg)
    const childrenNode = this.renderChildren(children)

    return (
      <ScrollFollower className="thread">
        {msgNode}
        {childrenNode}
      </ScrollFollower>
    )
  }

  renderMessage(msg) {
    if (!msg) {
      return ''
    }
    if (msg.content.startsWith('/me ')) {
      return (
        <div
          className="message emote"
          style={nickFgColor(msg.sender.name)}
          >
          <span className="nick">
            {msg.sender.name}
          </span>
          {msg.content.substr(4)}
          <Timestamp at={moment.unix(msg.time)} />
        </div>
      )
    }
    return (
      <div className="message">
        <div
          className="nick"
          style={nickFgColor(msg.sender.name)}
          >
          {msg.sender.name}
        </div>
        <div className="content">
          {msg.content}
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
