import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
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

    const { password } = this.refs
    if (password && !chat.authPending()) {
      const el = ReactDOM.findDOMNode(password)
      el.select()
    }
  }

  renderContent(users) {
    const { chat, dispatch, embedData, now } = this.props
    const { roomName } = chat

    if (chat.authRequired()) {
      const pending = chat.authPending()
      const failureReason = pending ? '' : chat.authFailureReason()
      const onSubmit = ev => {
        ev.preventDefault()
        dispatch({
          type: SEND_PACKET,
          roomName: chat.roomName,
          packet: {
            type: 'auth',
            data: {
              type: 'passcode',
              passcode: ev.target.password.value,
            },
          },
        })
      }
      return (
        <div className="chat-room-content">
          <div className="auth">
            <div className="hatching" />
            <form onSubmit={onSubmit}>
              <div>
                Password required to enter <span className="room-name">{roomName}</span>
              </div>
              <input name="password" ref="password" type="password" disabled={pending} autoFocus />
              <div className="failure">{failureReason}</div>
            </form>
          </div>
        </div>
      )
    }

    const userList = <UserList roomName={roomName} users={users} />

    return (
      <div className="chat-room-content">
        <ChatPane chat={chat} dispatch={dispatch} embedData={embedData} now={now} roomName={roomName} />
        <div className="room-sidebar">
          {chat.isUserListDisplayed() ? userList : null}
        </div>
      </div>
    )
  }

  render() {
    const { chat, dispatch } = this.props
    if (!chat) {
      return null
    }

    const { roomName, socketState } = chat
    const users = chat.userList()

    return (
      <div className="chat-room">
        <Connection
          dispatch={dispatch}
          roomName={roomName}
          sidebarActivated={chat.isUserListDisplayed()}
          socketState={socketState}
          users={users}
        />
        {this.renderContent(users)}
      </div>
    )
  }
}

ChatRoom.propTypes = {
  chat: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  embedData: PropTypes.instanceOf(Immutable.Map()).isRequired,
  now: PropTypes.instanceOf(Date),
}

function select(state, props) {
  const { roomName } = props
  const chat = state.chatSwitch.chats.get(roomName)
  const embedData = state.embed
  const now = state.now
  return { chat, embedData, now }
}

export default connect(select)(ChatRoom)
