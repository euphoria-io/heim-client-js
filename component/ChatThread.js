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
    const childrenNode = !!children.size ? this.renderChildren(children, msg && msg.sender.name) : null
    const msgNode = this.renderMessage(msg, !!children.size)

    return (
      <div className="thread">
        {msgNode}
        {childrenNode}
      </div>
    )
  }

  renderMessage(msg, withChildren) {
    if (!msg) {
      return ''
    }

    let messageStyle = {}
    let nickStyle = nickBgColor(msg.sender.name)
    if (withChildren) {
      nickStyle = {
        ...nickStyle,
        borderBottomLeftRadius: 0,
      }
      messageStyle = {
        ...messageStyle,
        borderTopLeftRadius: '0.3rem',
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: nickStyle.background,
      }
    }


    const emote = msg.content.startsWith('/me ')
    const className = emote ? 'message emote' : 'message'
    const content = emote ? msg.content.substr(4) : msg.content
    const contentStyle = emote ? nickBgLightColor(msg.sender.name) : null
    return (
      <div className={className} style={messageStyle}>
        <div className="sender">
          <div className="nick" style={nickStyle}>{msg.sender.name}</div>
        </div>
        <div className="content-and-time">
          <div className="content" style={contentStyle}>{content}</div>
          <Timestamp at={moment.unix(msg.time)} />
        </div>
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
