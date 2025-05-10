import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { Game }  from './middleware/game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//game = Game.serverInit();

const wss = new WebSocketServer({ port: 8080 });

let clients = [];
let clientId = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');

  const newPlayerId = clientId++;
  console.log(`Player ${newPlayerId} connected`);

  const x = Math.random() * 400;
  const y = Math.random() * 400;

  player = game.loadPlayer(newPlayerId, x, y, false, ws);
  console.log(game.players);

  ws.send(JSON.stringify({
    type: 'you',
    id: newPlayerId,
    x: x,
    y: y,
  }));

  ws.send(JSON.stringify({
    type: 'existingPlayers',
    clients: clients.map(p => ({ id: p.id, x: p.x, y: p.y }))
  }));

  clients.push({ id: newPlayerId, x: x, y: y, ws: ws });

  // Notify other clients about new player
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client !== ws) {
      client.send(JSON.stringify({
        type: 'playerJoined',
        id: newPlayerId,
        x: x,
        y: y,
      }));
    }
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'move') {
      const c = clients.find(p => p.id === message.id);
      if (c) {
        c.x = message.x;
        c.y = message.y;
        // Broadcast movement to other clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify({
              type: 'playerMoved',
              id: message.id,
              x: message.x,
              y: message.y,
            }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove client from clients array
    clients = clients.filter(client => client.ws !== ws);
    // Notify other clients about disconnection
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        // Find the disconnected client's id
        const disconnectedClient = clients.find(c => c.ws === ws);
        if (disconnectedClient) {
          client.send(JSON.stringify({
            type: 'playerDisconnected',
            id: disconnectedClient.id,
          }));
        }
      }
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const app = express();

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/middleware', express.static(path.join(__dirname, 'middleware')));

app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/index.html'));
});

app.get('/dev', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/dev.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/game.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/home.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/signup.html'));
});

// POST handlers
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const addedUser = await addUser(username, password);
  } catch (err) {
    res.status(500).send('Username already exists');
  }
  if (addedUser){
    res.redirect('/login');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await fetchUser('username', username);
    if (user.password === password) {
      res.redirect('/');
    } else {
      res.status(500).send('Username or password does not match');
    }
  } catch (err) {
    res.status(500).send('Username or password does not match');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening on port:', port);
});