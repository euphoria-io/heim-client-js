import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class App extends Component {
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
  sidebar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
}

export default connect(state => state)(App)
