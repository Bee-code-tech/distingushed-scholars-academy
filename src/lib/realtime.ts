/**
 * One Socket.IO connection to the API, shared by whoever is listening.
 *
 * The Community used to ask the server "anything new?" every six seconds per
 * open tab. Now the server tells the tab. The connection is created on first
 * use and dropped when the last user lets go, so a dashboard page that never
 * opens the chat never opens a socket.
 *
 * If the socket cannot connect (an old phone, a network that blocks
 * WebSockets and long-polling alike), the chat quietly keeps polling as it
 * did before — nothing here is required for the page to work.
 */
import { io, type Socket } from 'socket.io-client'

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.distinguishedscholarsacademy.com'
/** The API host without its `/api` suffix — where the socket server lives. */
export const API_ORIGIN = RAW_API_URL.replace(/\/+$/, '').replace(/\/api$/, '')

let socket: Socket | null = null
let socketToken = ''
let holders = 0

/**
 * Get the shared connection for this token, opening it if needed. Call
 * `releaseRealtime` once for every `acquireRealtime`.
 */
export function acquireRealtime(token: string): Socket | null {
  if (typeof window === 'undefined' || !token) return null
  if (socket && socketToken !== token) {
    socket.disconnect()
    socket = null
  }
  if (!socket) {
    socketToken = token
    socket = io(API_ORIGIN, {
      path: '/socket.io',
      auth: { token },
      // WebSocket first; if the network will not carry one, fall back to
      // long-polling rather than giving up.
      transports: ['websocket', 'polling'],
      tryAllTransports: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 10000,
    })
  }
  holders += 1
  return socket
}

export function releaseRealtime(): void {
  holders = Math.max(0, holders - 1)
  if (holders === 0 && socket) {
    socket.disconnect()
    socket = null
    socketToken = ''
  }
}

/** Shapes the server pushes. Kept loose: the chat normalises them itself. */
export interface JoinAck {
  ok: boolean
  channelId?: string
  message?: string
  online?: { id: string; fullname: string; role: string }[]
  typing?: { id: string; fullname: string; role: string }[]
}

export interface TypingEvent {
  channelId: string
  user: { id: string; fullname: string; role: string }
  typing: boolean
}

export interface PresenceEvent {
  channelId: string
  online: { id: string; fullname: string; role: string }[]
  onlineCount: number
}
