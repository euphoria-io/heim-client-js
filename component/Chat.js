import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'
import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { roomName, tree } = this.props
    return <ChatThread key={roomName} tree={tree} />
  }
}

Chat.propTypes = {
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state) {
  const { chatSwitch } = state
  const chat = chatSwitch.chats.get(chatSwitch.currentRoom)
  return chat
}

export default connect(select)(Chat)
