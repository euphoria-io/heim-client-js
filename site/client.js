import ReactDOM from 'react-dom'

import Socket from '../lib/Socket'

export default function client(store, view) {
  ReactDOM.render(view, document.getElementById('app'))
}
