import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { nickBgColor } from '../lib/nick'

import UserText from './UserText'

class Nick extends Component {
  render() {
    const { name, withThreadLine } = this.props
    let nickStyle = nickBgColor(name)
    if (withThreadLine) {
      nickStyle = {
        ...nickStyle,
        borderBottomLeftRadius: 0,
      }
    }
    return (
      <UserText className="nick" style={nickStyle} content={name} />
    )
  }
}

Nick.mixins = [PureRenderMixin]

Nick.propTypes = {
  name: PropTypes.string.isRequired,
  withThreadLine: PropTypes.bool,
}

export default Nick
