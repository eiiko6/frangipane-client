export interface User {
  uuid: string
  username: string
  email: string
  avatar_url: string
}

export interface LoginResponse {
  uuid: string
  username: string
  email: string
  token: string
}

export interface UpdateUserResponse {
  username: string
  email: string
}

export interface Room {
  uuid: string
  owner_name: string
  owner_uuid: string
  name: string
  global: boolean
  unread_count: number
}

export interface Message {
  uuid: string
  room_uuid: string
  sender: string
  sender_uuid: string
  message_type: 'text'
  content: string
  sent_at: string
}

export interface Friend {
  uuid: string
  username: string
}

export interface FriendRequest {
  sender_uuid: string
  sender_username: string
}

export interface RoomInvite {
  room_uuid: string
  room_name: string
  sender_uuid: string
  sender_username: string
}

export interface VersionResponse {
  version: string
}
