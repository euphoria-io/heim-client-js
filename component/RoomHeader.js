import React, { Component, PropTypes } from 'react'

import { TOGGLE_ROOM_SIDEBAR } from '../const'

import UserSummary from './UserSummary'

class RoomHeader extends Component {
  render() {
    const { dispatch, roomName, sidebarActivated, users } = this.props
    const toggleRoomSidebar = () => dispatch({
      type: TOGGLE_ROOM_SIDEBAR,
      roomName,
    })
    const userSummary = <UserSummary users={users} />
    const sidebarClassName = sidebarActivated ? 'room-sidebar activated' : 'room-sidebar'
    return (
      <div className="room-header">
        <div className="room">
          <div className="spacer" />
          <div className="room-details">
            <span className="room-name">{roomName}</span>
            Room description goes here.
          </div>
          <div className="spacer" />
        </div>
        <a className={sidebarClassName} onClick={toggleRoomSidebar}>
          <div className="row">
            <div className="center">
              <div className="spacer" />
              {userSummary}
              <div className="spacer" />
            </div>
            <div className="handle">
              <div>&nbsp;</div>
            </div>
          </div>
        </a>
      </div>
    )
  }
}

RoomHeader.propTypes = {
  dispatch: PropTypes.func.isRequired,
  roomName: PropTypes.string.isRequired,
  sidebarActivated: PropTypes.bool.isRequired,
  socketState: PropTypes.string.isRequired,
  users: PropTypes.shape({
    groups: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
}

export default RoomHeader
