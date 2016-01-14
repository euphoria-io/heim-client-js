import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { hue } from '../lib/hueHash'
import Tree from '../lib/Tree'

class ChatThread extends Component {
  render() {
    const { tree, parentId } = this.props
    const node = parentId ? tree.nodes.get(parentId) : null
    const children = tree.childrenOf(parentId)
    const msgElem = node ? this.renderMessage(node.message, node.followups) : null
    const childrenElem = this.renderChildren(tree, children)
    return (
      <div className="thread">
        {msgElem}
        {childrenElem}
      </div>
    )
  }

  renderMessage(msg, followups) {
    if (!msg) {
      return ''
    }
    let followupElems = null
    if (followups && followups.size) {
      followupElems = (
        <div className="followups">
          {followups.map(node => this.renderMessage(node.message))}
        </div>
      )
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
          {followupElems}
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
        {followupElems}
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
