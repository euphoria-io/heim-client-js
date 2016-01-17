import React, { Component } from 'react'
import { Link } from 'react-router'

export default class Home extends Component {
  render() {
    return (
      <ul className="home">
        <li><Link to="/room/srs/">&amp;srs</Link></li>
        <li><Link to="/room/test/">&amp;test</Link></li>
        <li><Link to="/room/xkcd/">&amp;xkcd</Link></li>
      </ul>
    )
  }
}
