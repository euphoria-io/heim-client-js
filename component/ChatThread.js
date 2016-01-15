import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { hue } from '../lib/hueHash'
import Tree from '../lib/Tree'

class ChatThread extends Component {
  render() {
    const { tree, parentId } = this.props
    const msg = parentId ? tree.nodes.get(parentId) : null
    const children = tree.childrenOf(parentId)
    const msgNode = this.renderMessage(msg)
    const childrenNode = this.renderChildren(tree, children)
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
    if (msg.content.startsWith('/me ')) {
      return (
        <div
          className="message emote"
          style={{color: 'hsl(' + hue(msg.sender.name) + ', 100%, 40%)'}}
          >
          <span className="nick">
            {msg.sender.name}
          </span>
          {msg.content.substr(4)}
        </div>
      )
    }
    return (
      <div className="message">
        <div
          className="nick"
          style={{color: 'hsl(' + hue(msg.sender.name) + ', 100%, 40%)'}}
          >
          {msg.sender.name}
        </div>
        <div className="content">{msg.content}</div>
      </div>
    )
  }

  renderChildren(tree, children) {
    if (!children) {
      return ''
    }
    return (
      <div className="children">
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

export default ChatThread