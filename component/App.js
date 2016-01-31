import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { EMBED_MESSAGE_RECEIVED } from '../const'

class App extends Component {
  componentDidMount() {
    if (typeof window !== 'undefined') {
      const { dispatch } = this.props
      this._onMessage = ev => this.onMessage(ev, dispatch)
      window.addEventListener('message', this._onMessage, false)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this._onMessage, false)
      this._onMessage = null
    }
  }

  onMessage(ev, dispatch) {
    // TODO: check origin
    const { data } = ev
    dispatch({
      type: EMBED_MESSAGE_RECEIVED,
      data,
    })
  }

  render() {
    const { content, sidebar } = this.props
    return (
      <div className="app-container">
        {sidebar && React.cloneElement(sidebar)}
        {content && React.cloneElement(content)}
      </div>
    )
  }
}

App.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  dispatch: PropTypes.func.isRequired,
  sidebar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
}

export default connect(state => state)(App)
