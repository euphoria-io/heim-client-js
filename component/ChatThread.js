import React, { Component, PropTypes } from 'react'

import { nickBgColor } from '../lib/nick'
import Tree from '../lib/Tree'

import ChatEntry from './ChatEntry'
import Message from './Message'

class ChatThread extends Component {
  shouldComponentUpdate(nextProps) {
    const { msg, now, tree } = this.props
    if (msg !== nextProps.msg || now !== nextProps.now) {
      return true
    }

    // Look for changes under descendants of this thread's root message.
    const prefix = msg ? tree.paths.get(msg.id) : ''
    const filter = path => path.startsWith(prefix)
    let changeLog = nextProps.tree.changeLog
    while (changeLog && changeLog !== tree.changeLog) {
      const changes = changeLog.paths.filter(filter)
      if (!!changes.first()) {
        return true
      }
      changeLog = changeLog.prev
    }

    return false
  }

  renderChildren(children, parentNick) {
    if (!children || !children.size) {
      return ''
    }
    let style = {}
    if (parentNick) {
      style = {
        ...style,
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: nickBgColor(parentNick).background,
      }
    }
    const { entry, now, tree } = this.props
    return (
      <div ref="children" className="children" style={style}>
        {children.valueSeq().map(msg =>
          <ChatThread entry={entry} key={msg.id} msg={msg} now={now} tree={tree} />
        )}
      </div>
    )
  }

  render() {
    const { entry, msg, now, tree } = this.props
    if (!tree) {
      return null
    }

    const children = msg ? tree.childrenOf(msg.id) : tree.childrenOf(null)
    const msgNode = msg ? <Message msg={msg} hasChildren={!!children.size} now={now} /> : null
    const childrenNode = !!children.size ? this.renderChildren(children, msg && msg.sender.name) : null
    const attachEntry = (!msg && !entry.parentId) || msg.id === entry.parentId

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
        {attachEntry ? entry : null}
      </div>
    )
  }
}

ChatThread.propTypes = {
  entry: PropTypes.instanceOf(ChatEntry).isRequired,
  msg: PropTypes.object,
  now: PropTypes.instanceOf(Date).isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default ChatThread
