import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Socket from '../lib/Socket'
import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { roomName, tree } = this.props
    return <ChatThread roomName={roomName} tree={tree} />
  }
}

Chat.propTypes = {
  roomName: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state) {
  const { chatSwitch } = state
  return chatSwitch.chats.get(chatSwitch.currentRoom)
}

export default connect(select)(Chat)
