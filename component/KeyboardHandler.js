import _ from 'lodash'
import React, { Component, PropTypes } from 'react'

import Pane from './Pane'

class KeyboardHandler extends Component {
  componentDidMount() {
    const { keys, listenTo } = this.props
    _.forEach(keys, (value, key) => value && listenTo.bindKey(key, value))
  }

  componentWillUnmount() {
    const { keys, listenTo } = this.props
    _.forEach(keys, (value, key) => value && listenTo.unbindKey(key, value))
  }

  render() {
    return (
      <div {...this.props}>
        {this.props.children}
      </div>
    )
  }
}

KeyboardHandler.propTypes = {
  listenTo: PropTypes.instanceOf(Pane).isRequired,
  keys: PropTypes.objectOf(PropTypes.func),
  children: PropTypes.node,
}

export default KeyboardHandler
