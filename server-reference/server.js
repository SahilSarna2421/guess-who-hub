// ============================================
// Guess Who - Backend Server
// ============================================
// This file is a REFERENCE for your Node.js backend.
// It is NOT executed by Lovable. Deploy it separately.
//
// Dependencies: express, socket.io, cors, uuid
// Run: node server.js
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// In-memory room storage
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function broadcastRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (room) {
    io.to(roomCode).emit('room-updated', {
      code: room.code,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        selectedCharacter: p.selectedCharacter ? '***' : undefined, // hide from opponents
        eliminatedCharacters: p.eliminatedCharacters,
      })),
      characters: room.characters,
      phase: room.phase,
      winnerId: room.winnerId,
      correctCharacter: room.phase === 'game-over' ? room.correctCharacter : undefined,
    });
  }
}

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('create-room', (playerName) => {
    const code = generateRoomCode();
    const room = {
      code,
      players: [{ id: socket.id, name: playerName, isHost: true, selectedCharacter: null, eliminatedCharacters: [] }],
      characters: [],
      phase: 'lobby',
      winnerId: null,
      correctCharacter: null,
    };
    rooms.set(code, room);
    socket.join(code);
    currentRoom = code;
    broadcastRoom(code);
  });

  socket.on('join-room', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) return socket.emit('error', 'Room not found');
    if (room.players.length >= 2) return socket.emit('error', 'Room is full');
    room.players.push({ id: socket.id, name: playerName, isHost: false, selectedCharacter: null, eliminatedCharacters: [] });
    socket.join(roomCode);
    currentRoom = roomCode;
    broadcastRoom(roomCode);
  });

  socket.on('start-setup', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) return;
    room.phase = 'board-setup';
    broadcastRoom(currentRoom);
  });

  socket.on('add-character', ({ name, imageUrl }) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'board-setup') return;
    room.characters.push({ id: uuidv4(), name, imageUrl });
    broadcastRoom(currentRoom);
  });

  socket.on('remove-character', (characterId) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'board-setup') return;
    room.characters = room.characters.filter(c => c.id !== characterId);
    broadcastRoom(currentRoom);
  });

  socket.on('finish-setup', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;
    room.phase = 'character-selection';
    broadcastRoom(currentRoom);
  });

  socket.on('select-character', (characterId) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'character-selection') return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    player.selectedCharacter = characterId;
    if (room.players.every(p => p.selectedCharacter)) {
      room.phase = 'playing';
    }
    broadcastRoom(currentRoom);
  });

  socket.on('eliminate-character', (characterId) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'playing') return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    if (!player.eliminatedCharacters.includes(characterId)) {
      player.eliminatedCharacters.push(characterId);
    }
    broadcastRoom(currentRoom);
  });

  socket.on('restore-character', (characterId) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'playing') return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    player.eliminatedCharacters = player.eliminatedCharacters.filter(id => id !== characterId);
    broadcastRoom(currentRoom);
  });

  socket.on('guess-character', (characterId) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== 'playing') return;
    const opponent = room.players.find(p => p.id !== socket.id);
    if (!opponent) return;
    if (characterId === opponent.selectedCharacter) {
      room.winnerId = socket.id;
      room.correctCharacter = opponent.selectedCharacter;
      room.phase = 'game-over';
    } else {
      // Wrong guess — opponent wins
      room.winnerId = opponent.id;
      room.correctCharacter = opponent.selectedCharacter;
      room.phase = 'game-over';
    }
    broadcastRoom(currentRoom);
  });

  socket.on('rematch', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;
    room.phase = 'character-selection';
    room.winnerId = null;
    room.correctCharacter = null;
    room.players.forEach(p => {
      p.selectedCharacter = null;
      p.eliminatedCharacters = [];
    });
    broadcastRoom(currentRoom);
  });

  socket.on('disconnect', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    if (room.players.length === 0) {
      rooms.delete(currentRoom);
    } else {
      if (!room.players.some(p => p.isHost)) {
        room.players[0].isHost = true;
      }
      broadcastRoom(currentRoom);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
