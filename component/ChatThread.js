import React, { Component, PropTypes } from 'react'

import { nickBgColor } from '../lib/nick'

import ChatEntry from './ChatEntry'
import Message from './Message'
import Pane from './Pane'

class ChatThread extends Component {
  shouldComponentUpdate(nextProps) {
    const { chat, msg, now } = this.props
    const { tree } = chat

    if (msg !== nextProps.msg || now !== nextProps.now) {
      return true
    }

    // Look for changes under descendants of this thread's root message.
    const prefix = msg ? tree.paths.get(msg.id) : ''
    const filter = path => path.startsWith(prefix)
    let changeLog = nextProps.chat.tree.changeLog
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
    const { chat, dispatch, now, pane, roomName } = this.props
    return (
      <div ref="children" className="children" style={style}>
        {children.valueSeq().map(msg =>
          <ChatThread chat={chat}
            chat={chat}
            dispatch={dispatch}
            key={msg.id}
            msg={msg}
            now={now}
            pane={pane}
            roomName={roomName}
          />
        )}
      </div>
    )
  }

  renderChatEntry() {
    const { chat, dispatch, pane, roomName } = this.props
    const { cursorParent, editorText, nick } = chat

    return (
      <ChatEntry
        id="chat-entry"
        dispatch={dispatch}
        nick={nick}
        pane={pane}
        parentId={cursorParent}
        roomName={roomName}
        value={editorText}
      />
    )
  }

  renderMessage(hasChildren) {
    const { dispatch, msg, now, roomName } = this.props
    if (!msg) {
      return null
    }
    return (
      <Message
        dispatch={dispatch}
        msg={msg}
        hasChildren={hasChildren}
        now={now}
        roomName={roomName}
      />
    )
  }

  render() {
    const { chat, msg } = this.props
    const { cursorParent, tree } = chat
    if (!tree) {
      return null
    }

    const msgId = msg ? msg.id : null
    const children = tree.childrenOf(msgId)
    const msgNode = this.renderMessage(!!children.size)
    const childrenNode = !!children.size ? this.renderChildren(children, msg && msg.sender.name) : null
    const attachEntry = cursorParent === msgId || (!cursorParent && !msgId)

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
  chat: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  msg: PropTypes.object,
  now: PropTypes.instanceOf(Date).isRequired,
  pane: PropTypes.instanceOf(Pane).isRequired,
  roomName: PropTypes.string.isRequired,
}

export default ChatThread
