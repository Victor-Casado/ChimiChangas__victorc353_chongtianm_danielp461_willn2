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
let clientId = 0;

wss.on('connection', async (ws) => {
  console.log('Client connected');

  let newPlayer = null;
  let newPlayerId = 0;
  let playerExists = false;

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if(message.type ==='join'){
      const username = message.username;

      let players = game.players;
      for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if(player.username === username){
          newPlayer = player;
          newPlayerId = player.id;
          playerExists = true;
          break;
        }
      }
      
      if(!playerExists){
        newPlayerId = clientId++;
        newPlayer = new Player(username, newPlayerId, null, Math.random() * 400, Math.random() * 400, false, ws);
        game.players.push(newPlayer);
      }

      clients.push(
        {id: newPlayerId, 
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
      console.log(`Player ${newPlayerId} connected`);
    }
    
    if (message.type === 'move') {
      const p = game.players.find(p => p.getId() === message.player.id);
      if (p) {
        p.refresh(message.player);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify({
              type: 'playerMoved',
              player: message.player,
            }));
          }
        });
      }
    }
  });

  

  

  ws.on('close', () => {
  console.log('Client disconnected');
  const disconnectedClient = clients.find(c => c.ws === ws);
  clients = clients.filter(c => c.ws !== ws);

  if (disconnectedClient) {
    game.findPlayer(disconnectedClient.id).destroy();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(JSON.stringify({
          type: 'playerDisconnected',
          id: disconnectedClient.id,
        }));
      }
    });
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

  if (addedUser){
    res.redirect('/login');
  }
  else {
    res.status(500).send('Username already exists');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await fetchUser('username', username);
    if (user.password === password) {
      req.session.user = username;
      res.redirect('/home');
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
