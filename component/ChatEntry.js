import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import Nick from './Nick'

class ChatEntry extends Component {
  render() {
    const { id, nick } = this.props
    return (
      <div id={id} className="chat-entry">
        <div className="sender">
          <Nick name={nick || 'your name here'} />
        </div>
        <textarea defaultValue="chat here" />
      </div>
    )
  }
}

ChatEntry.mixins = [PureRenderMixin]

ChatEntry.propTypes = {
  id: PropTypes.string.isRequired,
  nick: PropTypes.string,
  parentId: PropTypes.string,
}

export default ChatEntry
