import { apiFetch } from './client'
import { UserProfile, type Room, type RoomInvite } from '../types'

export function fetchRooms() {
    return apiFetch<Room[]>(`/rooms`)
}

export function fetchRoomInfo(uuid: string) {
    return apiFetch<Room>(`/rooms/${uuid}`)
}

export function createRoom(name: string, global: boolean) {
    return apiFetch<Room>('/rooms', {
        method: 'POST',
        body: JSON.stringify({ name, global }),
    })
}

export function fetchRoomInvites() {
    return apiFetch<RoomInvite[]>('/rooms/invites')
}

export function sendRoomInvite(receiverUsername: string, roomUuid: string) {
    return apiFetch<void>('/rooms/invite', {
        method: 'POST',
        body: JSON.stringify({ receiver_username: receiverUsername, room_uuid: roomUuid }),
    });
}

export function acceptRoomInvite(senderUuid: string, roomUuid: string) {
    return apiFetch<void>('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ sender_uuid: senderUuid, room_uuid: roomUuid }),
    })
}

export function declineRoomInvite(senderUuid: string, roomUuid: string) {
    return apiFetch<void>('/rooms/decline', {
        method: 'POST',
        body: JSON.stringify({ sender_uuid: senderUuid, room_uuid: roomUuid }),
    })
}

export function leaveRoom(roomUuid: string) {
    return apiFetch<void>(`/rooms/${roomUuid}/leave`, {
        method: 'POST'
    })
}

export function deleteRoom(roomUuid: string) {
    return apiFetch<void>(`/rooms/${roomUuid}/delete`, {
        method: 'DELETE'
    })
}

export function transferOwnership(roomUuid: string, newOwnerUuid: string) {
    return apiFetch<void>('/rooms/transfer-ownership', {
        method: 'POST',
        body: JSON.stringify({ room_uuid: roomUuid, new_owner_uuid: newOwnerUuid }),
    })
}

export function listMembers(roomUuid: string) {
    return apiFetch<UserProfile[]>(`/rooms/${roomUuid}/members`)
}
