import React, { Component } from 'react'
import { Link } from 'react-router'

export default class Home extends Component {
  render() {
    return (
      <div className="home">
        Check out a <Link to="/room/xkcd">chat room</Link>.
      </div>
    )
  }
}
