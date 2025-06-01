import express from 'express';
import session from 'express-session';
import WebSocket, { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { addUser, fetchUser, updateUsername} from './db_scripts/login.js';
import { Game }  from './middleware/game.js';
import { Player }  from './middleware/player.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wss = new WebSocketServer({ port: 8080 });

const MAX_PLAYERS = 2;
const VISIBILITY_RADIUS = 800;

// Main rooms structure: { [roomCode]: { game, clients: [{id, x, y, ws}], ... } }
const rooms = {};

function isWithinRadius(p1, p2, radius) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy <= radius * radius;
}

function broadcastPlayerCount(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  room.clients.forEach(clientObj => {
    if (clientObj.ws.readyState === WebSocket.OPEN) {
      clientObj.ws.send(JSON.stringify({
        type: 'playerCount',
        count: room.clients.length,
        max: MAX_PLAYERS
      }));
    }
  });
}

wss.on('connection', async (ws) => {
  let roomCode = null;
  let newPlayer = null;

  ws.on('message', async (data) => {
    const message = JSON.parse(data);

    // JOIN HANDLER: roomCode is sent by client
    if(message.type === 'join'){
      const username = message.username;
      roomCode = (message.roomCode || '').toUpperCase();
      if (!roomCode) {
        ws.send(JSON.stringify({ type: 'error', error: 'No room code provided' }));
        ws.close();
        return;
      }

      // Create room if doesn't exist
      if (!rooms[roomCode]) {
        rooms[roomCode] = {
          game: await Game.serverInit(),
          clients: []
        };
      }
      const room = rooms[roomCode];

      // Enforce max players per room
      if (room.clients.length >= MAX_PLAYERS) {
        ws.send(JSON.stringify({ type: 'roomFull' }));
        ws.close();
        return;
      }

      // Spawn the new player at random locations
      let random = Math.random();
      if (random < 1.1){
        newPlayer = new Player(username, username, null, 1900, 800, false, ws);
      }
      if (random < .75){
        newPlayer = new Player(username, username, null, 0, 800, false, ws);
      }
      if (random < .5){
        newPlayer = new Player(username, username, null, 1900, 0, false, ws);
      }
      if (random < .25){
        newPlayer = new Player(username, username, null,0, 0, false, ws);
      }
      room.game.players.push(newPlayer);

      room.clients.push({
        id: username,
        x: newPlayer.x,
        y: newPlayer.y,
        ws: ws
      });

      // Send to joining client
      ws.send(JSON.stringify({
        type: 'you',
        player: newPlayer.toJSON(),
        gameState: room.game.stateJSON()
      }));

      ws.send(JSON.stringify({
        type: 'existingPlayers',
        clients: room.game.players.map(p => (p.toJSON())),
        localUser: username
      }));

      // Notify other clients in this room
      room.clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
          clientObj.ws.send(JSON.stringify({
            type: 'playerJoined',
            player: newPlayer.toJSON(),
          }));
        }
      });

      broadcastPlayerCount(roomCode);
    }

    // All other message types must operate on the correct room
    if (!roomCode || !rooms[roomCode]) return;
    const room = rooms[roomCode];
    const game = room.game;
    const clients = room.clients;

    if (message.type === 'move') {
      const p = game.players.find(p => p.getId() === message.player.id);
      if (p) {
        p.refresh(message.player);

        clients.forEach(clientObj => {
          if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
            const targetClient = clientObj;
            if (!targetClient || targetClient.id === message.player.id) return;

            const sender = game.players.find(p => p.getId() === message.player.id);
            const receiver = game.players.find(p => p.getId() === targetClient.id);

            if (!sender || !receiver) return;

            if (isWithinRadius(sender.position, receiver.position, VISIBILITY_RADIUS)) {
              clientObj.ws.send(JSON.stringify({
                type: 'playerMoved',
                player: message.player,
              }));
            }
          }
        });
      }
    }

    if (message.type === 'openChest') {
      const chest = message.chest;

      clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
          clientObj.ws.send(JSON.stringify({
            type: 'openChest',
            chest: chest,
          }));
        }
      });

      game.chests[chest.id].opened = true;
    }

    if (message.type === 'addItem') {
      const item = message.item;
      game.items.push(item);
      clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN) {
          clientObj.ws.send(JSON.stringify({
            type: 'addItem',
            item: item,
          }));
        }
      });
    }

    if (message.type === 'itemState') {
      const items = message.itemState;
      items.forEach((item) => {
        game.items[item.id] = item;
      });
      clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
          clientObj.ws.send(JSON.stringify({
            type: 'itemState',
            items: items,
          }));
        }
      });
    }

    if (message.type === 'fire') {
      const gun = message.gun;
      clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
          clientObj.ws.send(JSON.stringify({
            type: 'fire',
            gun: gun,
            x: message.x,
            y: message.y,
          }));
        }
      });
    }

    if (message.type === 'health') {
      const playerId = message.id;
      if(game.players.find((player) => player.id == playerId) == null){
        return;
      }
      game.players.find((player) => player.id == playerId).health = message.health;
      clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
          clientObj.ws.send(JSON.stringify({
            type: 'health',
            id: playerId,
            health: message.health
          }));
        }
      });
      if(message.health <= 0){
        game.kill(playerId);
        clients.forEach(clientObj => {
          if (clientObj.ws.readyState === WebSocket.OPEN) {
            clientObj.ws.send(JSON.stringify({
              type: 'death',
              id: playerId,
            }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    if (!roomCode || !rooms[roomCode]) return;
    const room = rooms[roomCode];
    let disconnectedClient = room.clients.find(c => c.ws === ws);
    room.clients = room.clients.filter(c => c.ws !== ws);

    if (disconnectedClient) {
      const player = room.game.findPlayer(disconnectedClient.id);
      if(player){
        player.destroy();
        room.game.removePlayer(player.id);
      }
      room.clients.forEach(clientObj => {
        if (clientObj.ws.readyState === WebSocket.OPEN && clientObj.ws !== ws) {
          clientObj.ws.send(JSON.stringify({
            type: 'playerDisconnected',
            id: disconnectedClient.id,
          }));
        }
      });
    }
    broadcastPlayerCount(roomCode);
    // Clean up empty rooms
    if (room.clients.length === 0) {
      delete rooms[roomCode];
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const app = express();

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

let logged_in = false;

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/middleware', express.static(path.join(__dirname, 'middleware')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve game for any room code
app.get('/room/:roomCode', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public/templates/game.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/index.html'));
});
app.get('/dev', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/dev.html'));
});

app.get('/game', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public/templates/game.html'));
});

app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  let username = req.session.user;
  res.sendFile(path.join(__dirname, 'public/templates/home.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/signup.html'));
});

app.get('/me', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  res.json({ username: req.session.user });
});

// POST handlers
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  let addedUser = await addUser(username, password);
  const txt = `
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<center>
<h1>
Username Already Exists <br><br>
</h1>
<form action="/">
<button class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg">
  Home
</form>
</button>
<br>
<img src="https://www.freeiconspng.com/uploads/smiley-sad-face-png-26.png">
</center>
`
  if (addedUser){
    res.redirect('/login');
  }
  else {
    res.status(500).send(txt);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const txt = `
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<center>
<h1>
Username or password does not match <br><br>
</h1>
<form action="/">
<button class="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg">
  Home
</form>
</button>
<br>
<img src="https://www.freeiconspng.com/uploads/smiley-sad-face-png-26.png">
</center>
`

  try {
      const user = await fetchUser('username', username);
      if (user.password === password) {
        req.session.user = username;
        res.redirect('/home');
      } else {
        res.status(500).send(txt);
      }
    } catch (err) {
      res.status(500).send(txt);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  //console.log('Listening on port:', port);
});
