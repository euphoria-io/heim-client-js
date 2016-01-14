import { WS_CONNECTING, WS_CONNECTED, WS_DISCONNECTED, WS_MESSAGE_RECEIVED } from '../const'

const initialState = {
  socketState: 'disconnected',
}

export default function connection(state=initialState, action) {
  switch (action.type) {
    case WS_CONNECTING:
      return {socketState: 'connecting'}
    case WS_CONNECTED:
      return {socketState: 'connected'}
    case WS_DISCONNECTED:
      return {socketState: 'disconnected'}
    default:
      return state
  }
}
