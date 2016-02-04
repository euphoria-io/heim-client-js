import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

class UserSummary extends Component {
  render() {
    const { users } = this.props

    const describe = (groupName, singular) => {
      const group = users.groups.get(groupName)
      const noun = (group && group.size === 1) ? singular : groupName
      const adverb = (groupName === 'people') ? 'here' : ''
      const total = group ? group.size : 0

      return (
        <div className={groupName}>
          {groupName === 'people' ? <span className="number">{total}</span> : total
          } {noun} {adverb}
        </div>
      )
    }

    return (
      <div className="user-summary">
        <div className="content">
          {describe('people', 'person')}
          {describe('bots', 'bot')}
        </div>
      </div>
    )
  }
}

UserSummary.mixins = [PureRenderMixin]

UserSummary.propTypes = {
  users: PropTypes.shape({
    groups: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
}

export default UserSummary
