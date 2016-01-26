import _ from 'lodash'
import { Component } from 'react'
import ReactDOM from 'react-dom'

export default class Pane extends Component {
  constructor() {
    super()
    this._mousetrap = null
    this._prebindings = {}
  }

  componentDidMount() {
    console.log('pane did mount')
    if (typeof window !== 'undefined') {
      const Mousetrap = require('mousetrap')
      this._mousetrap = Mousetrap(ReactDOM.findDOMNode(this))
      _.forEach(this._prebindings, (value, key) => this._mousetrap.bind(key, value))
      this._prebindings = null
    }
  }

  componentWillUnmount() {
    if (this._mousetrap) {
      this._mousetrap.reset()
      this._mousetrap = null
      this._prebindings = {}
    }
  }

  bindKey(key, handler) {
    if (this._mousetrap) {
      this._mousetrap.bind(key, handler)
    } else {
      this._prebindings[key] = handler
    }
  }

  unbindKey(key, handler) {
    if (this._mousetrap) {
      this._mousetrap.unbind(key, handler)
    }
  }
}
