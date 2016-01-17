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
    const childrenNode = this.renderChildren(tree, children)

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

  renderChildren(tree, children) {
    if (!children) {
      return ''
    }
    return (
      <div ref="children" className="children">
        {children.map(msgId =>
          <ChatThread key={msgId} tree={tree} parentId={msgId} />
        )}
      </div>
    )
  }

}

ChatThread.propTypes = {
  tree: PropTypes.instanceOf(Tree).isRequired,
  parentId: PropTypes.string,
}

function select(state) {
  const { chatSwitch } = state
  return chatSwitch.chats.get(chatSwitch.currentRoom)
}

export default connect(select)(ChatThread)
