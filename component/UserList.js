import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Tree from '../lib/Tree'

class UserList extends Component {
  render() {
    const { users } = this.props
    
    return (
      <div className="user-list">
        {users
           .filter(user => user.name)
           .sortBy(user => user.id.startsWith('bot:') ? '2-' : '1-'+user.name.toLowerCase())
           .map(user => this.renderUser(user))}
      </div>
    )
  }

  renderUser(user) {
    return (
      <div className="nick">
        {user.name}
      </div>
    )
  }
}

UserList.propTypes = {
  users: PropTypes.instanceOf(Immutable.List).isRequired,
}

export default UserList
