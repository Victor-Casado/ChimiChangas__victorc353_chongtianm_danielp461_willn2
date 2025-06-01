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

let game;
(async () => {
  game = await Game.serverInit();
})();

const wss = new WebSocketServer({ port: 8080 });

let clients = [];

const VISIBILITY_RADIUS = 800;
const MAX_PLAYERS = 2; // Set max players here

function isWithinRadius(p1, p2, radius) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy <= radius * radius;
}

// Broadcast player count to all clients
function broadcastPlayerCount() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'playerCount',
        count: clients.length,
        max: MAX_PLAYERS
      }));
    }
  });
}

wss.on('connection', async (ws) => {
  let newPlayer = null;

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if(message.type ==='join'){
      // === MAX PLAYER CHECK START ===
      if (clients.length >= MAX_PLAYERS) {
        ws.send(JSON.stringify({ type: 'roomFull' }));
        ws.close();
        return;
      }
      // === MAX PLAYER CHECK END ===

      const username = message.username;

      var random = Math.random();
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
      game.players.push(newPlayer);

      clients.push(
        {id: username,
          x: newPlayer.x,
          y: newPlayer.y,
          ws: ws }
      );

      ws.send(JSON.stringify({
        type: 'you',
        player: newPlayer.toJSON(),
        gameState: game.stateJSON()
      }));

      ws.send(JSON.stringify({
        type: 'existingPlayers',
        clients: game.players.map(p => (p.toJSON())),
        localUser: username
      }));

      // Notify other clients about new player
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({
            type: 'playerJoined',
            player: newPlayer.toJSON(),
          }));
        }
      });

      broadcastPlayerCount();
    }

    if (message.type === 'move') {
      const p = game.players.find(p => p.getId() === message.player.id);
      if (p) {
        p.refresh(message.player);

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            const targetClient = clients.find(c => c.ws === client);
            if (!targetClient || targetClient.id === message.player.id) return;

            const sender = game.players.find(p => p.getId() === message.player.id);
            const receiver = game.players.find(p => p.getId() === targetClient.id);

            if (!sender || !receiver) return;

            if (isWithinRadius(sender.position, receiver.position, VISIBILITY_RADIUS)) {
              client.send(JSON.stringify({
                type: 'playerMoved',
                player: message.player,
              }));
            }

          }
        });
      }
    }
    if( message.type === 'openChest'){
      const chest = message.chest;

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({
            type: 'openChest',
            chest: chest,
          }));
        }
      });

      game.chests[chest.id].opened = true;
    }

    if( message.type === 'addItem'){
      const item = message.item;
      game.items.push(item);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN ) {
          client.send(JSON.stringify({
            type: 'addItem',
            item: item,
          }));
        }
      });
    }

    if( message.type === 'itemState'){
      const items = message.itemState;
      items.forEach((item) => {
        game.items[item.id] = item;
      });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({
            type: 'itemState',
            items: items,
          }));
        }
      });
    }

    if( message.type === 'fire'){
      const gun = message.gun;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({
            type: 'fire',
            gun: gun,
            x: message.x,
            y: message.y,
          }));
        }
      });
    }

    if( message.type === 'health'){
      const playerId = message.id;
      if(game.players.find((player) => player.id == playerId) == null){
        return;
      }
      game.players.find((player) => player.id == playerId).health = message.health;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({
            type: 'health',
            id: playerId,
            health: message.health
          }));
        }
      });
      if(message.health <= 0){
        game.kill(playerId);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'death',
              id: playerId,
            }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    const disconnectedClient = clients.find(c => c.ws === ws);
    clients = clients.filter(c => c.ws !== ws);

    if (disconnectedClient) {
      const player = game.findPlayer(disconnectedClient.id);
      if(player){
        player.destroy();
        game.removePlayer(player.id);
      }
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(JSON.stringify({
            type: 'playerDisconnected',
            id: disconnectedClient.id,
          }));
        }
      });
    }
    broadcastPlayerCount();
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

// Routes
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
