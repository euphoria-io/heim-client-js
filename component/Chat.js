import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Backlog from '../lib/Backlog'
import ScrollFollower from '../lib/ScrollFollower'
import SocketSwitch from '../lib/SocketSwitch'
import Tree from '../lib/Tree'

import ChatThread from './ChatThread'

class Chat extends Component {
  render() {
    const { roomName, socketSwitch, tree } = this.props
    const backlog = new Backlog(socketSwitch, roomName)
    return (
      <ScrollFollower className="children top" backlog={backlog}>
        <ChatThread roomName={roomName} tree={tree} />
      </ScrollFollower>
    )
  }
}

Chat.propTypes = {
  roomName: PropTypes.string.isRequired,
  socketSwitch: PropTypes.instanceOf(SocketSwitch).isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
}

function select(state) {
  const { chatSwitch } = state
  return chatSwitch.chats.get(chatSwitch.currentRoom)
}

export default connect(select)(Chat)
