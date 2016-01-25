import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { SEND_PACKET } from '../const'

import ChatPane from './ChatPane'
import Connection from './Connection'
import UserList from './UserList'

class ChatRoom extends Component {
  componentDidUpdate() {
    const { chat, dispatch } = this.props
    if (!chat) {
      return
    }
    if (!chat.fetching && !chat.complete && chat.oldestDisplayedMsgId) {
      if (chat.tree.needMore(chat.oldestDisplayedMsgId)) {
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
      }
    }
  }

  render() {
    const { chat, dispatch, now } = this.props
    if (!chat) {
      return null
    }

    const { nick, oldestMsgId, roomName, socketState, tree, users } = chat
    return (
      <div className="chat-room">
        <Connection roomName={roomName} socketState={socketState} />
        <div className="chat-room-content">
          <ChatPane
            dispatch={dispatch}
            nick={nick}
            now={now}
            oldestMsgId={oldestMsgId}
            roomName={roomName}
            tree={tree}
          />
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
