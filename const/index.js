const Action = a => '@@heim-client/' + a

export const EDIT_TEXT = Action('EDIT_TEXT')
export const EMBED_MESSAGE_RECEIVED = Action('EMBED_MESSAGE_RECEIVED')
export const MOVE_CURSOR = Action('MOVE_CURSOR')
export const SEND_PACKET = Action('SEND_PACKET')
export const TICK = Action('TICK')

export const WS_CONNECTING = Action('WS_CONNECTING')
export const WS_CONNECTED = Action('WS_CONNECTED')
export const WS_DISCONNECTED = Action('WS_DISCONNECTED')
export const WS_MESSAGE_RECEIVED = Action('WS_MESSAGE_RECEIVED')
export const WS_MESSAGE_SENT = Action('WS_MESSAGE_SENT')
