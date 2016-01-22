import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { nickBgColor } from '../lib/nick'

import UserText from './UserText'

class UserList extends Component {
  renderUserList(kind, users) {
    return !!users.size && (
      <div className={'user-list ' + kind}>
        <h1>{kind}</h1>
        {users.map(user => this.renderUser(user))}
      </div>
    )
  }

  renderUser(user) {
    return (
      <div key={user.session_id} className="user">
        <UserText className="nick" style={nickBgColor(user.name)} content={user.name} />
      </div>
    )
  }

  render() {
    const { users } = this.props
    if (!users) {
      return null
    }
    const groups = users.groupBy(v => /^bot:/.test(v.id) ? 'bots' : 'people')

    function uniqSeq(list) {
      if (!list) {
        return Immutable.Map().valueSeq()
      }
      let prev
      return list
        .sortBy(user => user.name.toLowerCase())
        .filter(v => {
          if (!v.name) {
            return false
          }
          const key = v.id + '/' + v.name
          if (prev === key) {
            return false
          }
          prev = key
          return true
        })
        .valueSeq()
    }

    return (
      <div className="users">
        {this.renderUserList('people', uniqSeq(groups.get('people')))}
        {this.renderUserList('bots', uniqSeq(groups.get('bots')))}
      </div>
    )
  }
}

UserList.propTypes = {
  roomName: PropTypes.string.isRequired,
  users: PropTypes.instanceOf(Immutable.Map).isRequired,
}

export default UserList
