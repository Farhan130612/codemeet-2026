import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (window.location.port === '5173'
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : window.location.origin);

export const socket: Socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export const SESSION_KEYS = {
  PARTICIPANT_ID: 'codemeet_participant_id',
  PARTICIPANT_NAME: 'codemeet_participant_name',
  HOST_TOKEN: 'codemeet_host_token_',
};

export function getSavedParticipantId(): string | null {
  return localStorage.getItem(SESSION_KEYS.PARTICIPANT_ID);
}

export function saveParticipantSession(id: string, name: string): void {
  localStorage.setItem(SESSION_KEYS.PARTICIPANT_ID, id);
  localStorage.setItem(SESSION_KEYS.PARTICIPANT_NAME, name);
}

export function saveHostToken(roomId: string, token: string): void {
  localStorage.setItem(`${SESSION_KEYS.HOST_TOKEN}${roomId}`, token);
}

export function getHostToken(roomId: string): string | null {
  return localStorage.getItem(`${SESSION_KEYS.HOST_TOKEN}${roomId}`);
}
