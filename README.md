# 🦁 Guess Who - Multiplayer Game
# Created by SAHIL SARNA

🌐 **Live Website:** https://guess-who-hub.vercel.app

A real-time multiplayer web version of the classic **Guess Who** game.  
Players can create rooms, join friends, and play turn-based guessing with live updates.

---

## 🧠 Features

- 🎮 Real-time multiplayer gameplay using WebSockets
- 🧑‍🤝‍🧑 Create or join rooms with a unique code
- 🔄 Turn-based game system
- ❌ Eliminate / restore characters dynamically
- ❓ Guess opponent's character
- 🏁 Final guess system (chance to draw)
- 🔁 Rematch functionality
- 🖼️ Automatic character image fetching (Wikipedia API)
- 📱 Responsive UI

---

## ⚙️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui

### Backend
- Node.js
- Express.js
- Socket.IO
- UUID

### Realtime Communication
- WebSockets (Socket.IO)

### Deployment
- Frontend: Vercel
- Backend: Render

---

## 🏗️ How It Works

1. Players open the website and connect to the server via Socket.IO
2. One player creates a room, another joins using the room code
3. Host sets up the board (characters + images)
4. Both players select a secret character
5. Game begins with turn-based actions:
   - Eliminate characters
   - Guess opponent’s character
6. Correct guess → win  
   Wrong guess → turn switches  
7. Special rule: second player gets a final chance to draw
8. Game ends → rematch option available

---

