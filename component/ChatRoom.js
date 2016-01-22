import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Tree from '../lib/Tree'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  render() {
    const { now, roomName, socketState, tree, users } = this.props
    if (!roomName) {
      return null
    }
    return (
      <div className="chat-room">
        <Connection roomName={roomName} socketState={socketState} />
        <div className="chat-room-content">
          <Chat now={now} roomName={roomName} tree={tree} />
          <UserList roomName={roomName} users={users} />
        </div>
      </div>
    )
  }
}

ChatRoom.propTypes = {
  now: PropTypes.instanceOf(Date),
  roomName: PropTypes.string,
  socketState: PropTypes.string.isRequired,
  tree: PropTypes.instanceOf(Tree).isRequired,
  users: PropTypes.instanceOf(Immutable.Map).isRequired,
}

function select(state, props) {
  const { roomName } = props
  const newState = state.chatSwitch.chats.get(roomName)
  return {
    ...newState,
    now: state.now,
  }
}

export default connect(select)(ChatRoom)
