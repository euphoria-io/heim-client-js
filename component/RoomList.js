import moment from 'moment'
import React from 'react'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import Link from './Link'
import Timestamp from './Timestamp'

function RoomList({ now, push, rooms }) {
  function renderRoom(roomName, room) {
    const href = `/room/${roomName}/`
    return (
      <div key={roomName} className="room">
        <Link push={push} to={href}>&amp;{roomName}</Link>
        <Timestamp at={moment.unix(room.get('lastActive'))} now={now} />
      </div>
    )
  }

  return (
    <div className="rooms">
      <div className="bar" />
      <h1>rooms</h1>
      <div className="room-list">
        {rooms
          .sortBy((room, roomName) => roomName)
          .entrySeq()
          .map(entry => renderRoom(entry[0], entry[1]))}
      </div>
    </div>
  )
}

function select({ now, rooms }) {
  return { now, rooms }
}

export default connect(select, routeActions)(RoomList)
