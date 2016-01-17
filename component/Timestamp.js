import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

function isMoment(prop, propName) {
  if (!moment.isMoment(prop[propName])) {
    return new Error('not a Moment instance')
  }
}

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
  at: PropTypes.oneOfType([PropTypes.number, isMoment]).isRequired,
  now: PropTypes.instanceOf(Date).isRequired,
}

function select(state) {
  return state.now
}

export default connect(select)(Timestamp)
