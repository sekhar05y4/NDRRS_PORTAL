import { io } from 'socket.io-client';

// Connect to backend server on port 5001
export const socket = io('http://127.0.0.1:5001', {
  autoConnect: true,
  reconnection: true
});
