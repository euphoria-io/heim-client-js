import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { routeActions } from 'redux-simple-router'

class Home extends Component {
  componentDidMount() {
    const { push } = this.props
    push('/room/welcome/')
  }

  render() {
    return (
      <div className="home">Loading...</div>
    )
  }
}

Home.propTypes = {
  push: PropTypes.func.isRequired,
}

export default connect(null, routeActions)(Home)
