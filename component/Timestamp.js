import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

function isMoment(prop, propName) {
  if (!moment.isMoment(prop[propName])) {
    return new Error('not a Moment instance')
  }
}

class Timestamp extends Component {
  render() {
    const { at, now } = this.props
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
  now: PropTypes.instanceOf(Date),
}

Timestamp.mixins = [PureRenderMixin]

export default Timestamp
