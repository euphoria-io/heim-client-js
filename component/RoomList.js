import React from 'react'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

import ActivityIndicator from './ActivityIndicator'
import Link from './Link'

function RoomList({ push, chatSwitch }) {
  function renderRoom(roomName, room, isCurrent) {
    const href = `/room/${roomName}/`
    const lastActive = room.localStorage.get('lastActive')
    const lastVisited = room.localStorage.get('lastVisited')
    const isActive = !!lastActive && (!lastVisited || lastActive > lastVisited)
    const activityIndicator = isActive ? <ActivityIndicator push={push} to={href} /> : null
    const className = isCurrent ? 'room current' : 'room'
    return (
      <div key={roomName} className={className}>
        <Link push={push} to={href}>
          {roomName}
        </Link>
        {activityIndicator}
      </div>
    )
  }

  console.log('re-rendering roomlist')
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

function select({ chatSwitch }) {
  return { chatSwitch }
}

export default connect(select, routeActions)(RoomList)
