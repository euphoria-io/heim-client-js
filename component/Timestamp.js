import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class Timestamp extends Component {
  render() {
    const { at, now } = this.props
    let display
    if (moment(now).diff(at, 'minutes') === 0) {
      return null
    }
    return (
      <time dateTime={at.toISOString()} title={at.format('MMMM Do YYYY, h:mm:ss a')}>
        {at.locale('en-short').from(now, true)}
      </time>
    )
  }
}

Timestamp.propTypes = {
  at: PropTypes.instanceOf(moment.Moment).isRequired,
  now: PropTypes.instanceOf(Date).isRequired,
}

function select(state) {
  return state.now
}

export default connect(select)(Timestamp)
