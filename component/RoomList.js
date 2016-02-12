import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import Link from './Link'
import Timestamp from './Timestamp'

function RoomList({ now, push, chatSwitch }) {
  function renderRoom(roomName, room, isCurrent) {
    const href = `/room/${roomName}/`
    const className = isCurrent ? 'room current' : 'room'
    return (
      <div key={roomName} className={className}>
        <Link push={push} to={href}>{roomName}</Link>
        <Timestamp at={moment.unix(room.localStorage.get('lastActive'))} now={now} />
      </div>
    )
  }

  return (
    <div className="rooms">
      <div className="bar" />
      <h1>rooms</h1>
      <div className="room-list">
        {chatSwitch.chats
          .sortBy((room, roomName) => roomName)
          .entrySeq()
          .map(entry => renderRoom(entry[0], entry[1], entry[0] === chatSwitch.currentRoom))}
      </div>
    </div>
  )
}

function select({ chatSwitch, now }) {
  return { chatSwitch, now }
}

export default connect(select, routeActions)(RoomList)
