import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { SEND_PACKET } from '../const'

import Chat from './Chat'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  componentDidUpdate() {
    console.log('update')
    const { chat, dispatch } = this.props
    if (!chat) {
      return
    }
    if (!chat.fetching && !chat.complete && chat.oldestDisplayedMsgId) {
      if (chat.tree.needMore(chat.oldestDisplayedMsgId)) {
        console.log('fetching')
        dispatch({
          type: SEND_PACKET,
          roomName: chat.roomName,
          packet: {
            type: 'log',
            data: {
              before: chat.oldestMsgId,
              n: 100,
            },
          },
        })
      } else {
        console.log('tree is satisfied')
      }
    } else {
      console.log('already fetching or no reason to fetch')
    }
  }

  render() {
    const { now, chat } = this.props
    if (!chat) {
      return null
    }

    const { nick, roomName, socketState, tree, users } = chat
    return (
      <div className="chat-room">
        <Connection roomName={roomName} socketState={socketState} />
        <div className="chat-room-content">
          <Chat nick={nick} now={now} roomName={roomName} tree={tree} />
          <UserList roomName={roomName} users={users} />
        </div>
      </div>
    )
  }
}

ChatRoom.propTypes = {
  chat: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  now: PropTypes.instanceOf(Date),
}

function select(state, props) {
  const { roomName } = props
  const chat = state.chatSwitch.chats.get(roomName)
  const now = state.now
  return { chat, now }
}

export default connect(select)(ChatRoom)
