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

  renderChildren(children, parentNick, attachEntry) {
    if ((!children || !children.size) && !attachEntry) {
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

    if (!children || !children.size) {
      return (
        <div ref="children" className="children" style={style}>
          {this.renderChatEntry()}
        </div>
      )
    }

    const { chat, dispatch, now, pane, roomName } = this.props
    const renderChild = (msg, terminal) => (
      <ChatThread
        chat={chat}
        dispatch={dispatch}
        key={msg.id}
        msg={msg}
        now={now}
        pane={pane}
        roomName={roomName}
        terminal={terminal}
      />
    )

    const msgs = children.valueSeq()

    return (
      <div ref="children" className="children" style={style}>
        {msgs.butLast().map(msg => renderChild(msg))}
        {renderChild(msgs.last(), true)}
        {attachEntry ? this.renderChatEntry() : null}
      </div>
    )
  }

  renderChatEntry() {
    const { chat, dispatch, pane, roomName } = this.props
    const { cursorParent, editor, nick } = chat

    return (
      <ChatEntry
        id="chat-entry"
        dispatch={dispatch}
        editor={editor}
        nick={nick}
        pane={pane}
        parentId={cursorParent}
        roomName={roomName}
      />
    )
  }

  renderMessage(hasChildren) {
    const { dispatch, msg, now, roomName, terminal } = this.props
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
        terminal={terminal}
      />
    )
  }

  render() {
    const { chat, msg, terminal } = this.props
    const { cursorParent, tree } = chat
    if (!tree) {
      return null
    }

    const msgId = msg ? msg.id : null
    const children = tree.childrenOf(msgId)
    const msgNode = this.renderMessage(!!children.size)
    const attachEntry = cursorParent === msgId || (!cursorParent && !msgId)
    const className = (terminal && (!children || !children.size) && !attachEntry) ? 'thread terminal' : 'thread'

    return (
      <div className={className}>
        {msgNode}
        {this.renderChildren(children, msg && msg.sender.name, attachEntry)}
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
  terminal: PropTypes.bool,
}

export default ChatThread
