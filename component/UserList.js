import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { nickFgColor } from '../lib/nick'
import Tree from '../lib/Tree'

class UserList extends Component {
  render() {
    const { users } = this.props
    const groups = users.groupBy((v, k, i) => /^bot:/.test(v.id) ? 'bots' : 'people')

    function uniqSeq(list) {
      if (!list) {
        return Immutable.Map().valueSeq()
      }
      let prev
      return list
        .sortBy(user => user.name.toLowerCase())
        .filter((v, k, i) => {
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

  renderUserList(kind, users) {
    return !!users.size && (
      <div className={"user-list " + kind}>
        <h1>{kind}</h1>
        {users.map(user => this.renderUser(user))}
      </div>
    )
  }

  renderUser(user) {
    return (
      <div
        key={user.session_id}
        className="nick"
        style={nickFgColor(user.name)}
        >
        {user.name}
      </div>
    )
  }
}

UserList.propTypes = {
  users: PropTypes.instanceOf(Immutable.Map).isRequired,
}

function select(state) {
  const { chatSwitch } = state
  return chatSwitch.chats.get(chatSwitch.currentRoom)
}

export default connect(select)(UserList)
