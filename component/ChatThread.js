import React, { Component, PropTypes } from 'react'

import { nickBgColor } from '../lib/nick'
import Tree from '../lib/Tree'

import ChatEntry from './ChatEntry'
import Message from './Message'
import Pane from './Pane'

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
    const { cursorParent, dispatch, nick, now, pane, roomName, tree } = this.props
    return (
      <div ref="children" className="children" style={style}>
        {children.valueSeq().map(msg =>
          <ChatThread
            cursorParent={cursorParent}
            dispatch={dispatch}
            key={msg.id}
            nick={nick}
            msg={msg}
            now={now}
            pane={pane}
            roomName={roomName}
            tree={tree}
          />
        )}
      </div>
    )
  }

  renderChatEntry() {
    const { cursorParent, dispatch, nick, pane, roomName } = this.props
    return (
      <ChatEntry
        id="chat-entry"
        dispatch={dispatch}
        nick={nick}
        pane={pane}
        parentId={cursorParent}
        roomName={roomName}
      />
    )
  }

  render() {
    const { cursorParent, msg, now, tree } = this.props
    if (!tree) {
      return null
    }

    const msgId = msg ? msg.id : null
    const children = tree.childrenOf(msgId)
    const msgNode = msg ? <Message msg={msg} hasChildren={!!children.size} now={now} /> : null
    const childrenNode = !!children.size ? this.renderChildren(children, msg && msg.sender.name) : null
    const attachEntry = cursorParent === msgId

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
        {attachEntry ? this.renderChatEntry() : null}
      </div>
    )
  }
}

ChatThread.propTypes = {
  cursorParent: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  msg: PropTypes.object,
  nick: PropTypes.string,
  now: PropTypes.instanceOf(Date).isRequired,
  pane: PropTypes.instanceOf(Pane).isRequired,
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

export default ChatThread
