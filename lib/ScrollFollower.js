import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
class ScrollFollower extends Component {
  constructor() {
    super()
    this.state = {
      follow: true,
      lastParentHeight: 0,
      lastScrollTop: 0,
    }
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this._handler = _.throttle(() => {
        if (this.state.follow) {
          const container = this._container()
          console.log('following')
          container.scrollTop = this._threshold(container)
          this.setState({
            lastScrollTop: container.scrollTop,
            lastParentHeight: container.parentNode.clientHeight,
          })
        }
      })
      window.addEventListener('resize', this._handler)
    }
  }

  componentWillReceiveProps() {
    console.log('receiving props')
    if (this.state.follow) {
      console.log('following')
      const container = this._container()
      container.scrollTop = this._threshold(container)
      this.setState({
        lastScrollTop: container.scrollTop,
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handler)
  }

  onScroll() {
    const container = this._container()
    const threshold = this._threshold(container)
    if (this.state.follow) {
      if (this.state.lastScrollTop === container.scrollTop) {
        return
      }
      if (this.state.lastParentHeight === container.parentNode.clientHeight) {
        this.setState({ follow: false })
        console.log('scroll unlocked') // eslint-disable-line no-console
      }
    } else {
      const follow = container.scrollTop >= threshold
      this.setState({ follow })
      if (follow) {
        console.log('scroll locked') // eslint-disable-line no-console
      }
    }

    this.setState({
      lastScrollTop: container.scrollTop,
      lastParentHeight: container.parentNode.clientHeight,
    })

    /*
    if (!this.state.follow && this.state.lastScrollTop < 10) {
      if (this.props.backlog) {
        this.props.backlog.fetchMore()
      }
    }
    */
  }

  _container() {
    return ReactDOM.findDOMNode(this)
  }

  _threshold(container) {
    return container.scrollHeight - container.clientHeight
  }

  render() {
    const { className, children } = this.props
    const onScroll = () => this.onScroll()
    return <div className={className} onScroll={onScroll}>{children}</div>
  }
}

ScrollFollower.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  className: PropTypes.string,
  roomName: PropTypes.string.isRequired,
}

export default ScrollFollower
