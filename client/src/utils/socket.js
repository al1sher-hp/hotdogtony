import { io } from 'socket.io-client';

// Use REACT_APP_BACKEND_URL environment variable for socket connection
const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
});

// Connection event handlers
socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

export default socket;
