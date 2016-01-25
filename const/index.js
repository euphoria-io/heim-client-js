const Action = a => '@@heim-client/' + a

export const KEY_PRESSED = Action('KEY_PRESSED')
export const MOVE_CHAT_ENTRY = Action('MOVE_CHAT_ENTRY')
export const SEND_PACKET = Action('SEND_PACKET')
export const TICK = Action('TICK')

export const WS_CONNECTING = Action('WS_CONNECTING')
export const WS_CONNECTED = Action('WS_CONNECTED')
export const WS_DISCONNECTED = Action('WS_DISCONNECTED')
export const WS_MESSAGE_RECEIVED = Action('WS_MESSAGE_RECEIVED')
export const WS_MESSAGE_SENT = Action('WS_MESSAGE_SENT')
