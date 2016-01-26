import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import { EDIT_TEXT } from '../const'

const initialState = {
  selectionDirection: 'forward',
  selectionStart: 0,
  selectionEnd: 0,
  value: '',
}

class Editor extends Component {
  componentDidMount() {
    this.resize()
    const el = ReactDOM.findDOMNode(this.refs.input)
    el.focus()
  }

  resize() {
    const { input, measure } = this.refs
    measure.style.width = input.offsetWidth + 'px'
    measure.value = input.value
    input.style.height = measure.scrollHeight + 'px'
  }

  render() {
    const { dispatch, editorId, roomName } = this.props
    const editorState = this.props.editorState || initialState
    const onChange = ev => {
      this.resize()
      dispatch({
        type: EDIT_TEXT,
        roomName,
        editor: {
          selectionDirection: ev.target.selectionDirection,
          selectionEnd: ev.target.selectionEnd,
          selectionStart: ev.target.selectionStart,
          value: ev.target.value,
        },
      })
    }
    const onClick = onChange

    return (
      <div id={'editor-' + editorId} className="editor">
        <textarea
          ref="input"
          defaultValue={editorState.value}
          onChange={onChange}
          onClick={onClick}
          selectionDirection={editorState.selectionDirection}
          selectionEnd={editorState.selectionEnd}
          selectionStart={editorState.selectionStart}
        />
        <textarea ref="measure" className="measure" />
      </div>
    )
  }
}

Editor.mixins = [PureRenderMixin]

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  editorId: PropTypes.string.isRequired,
  editorState: PropTypes.shape(initialState),
  roomName: PropTypes.string.isRequired,
}

export default Editor
