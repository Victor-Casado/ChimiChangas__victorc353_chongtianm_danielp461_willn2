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

wss.on('connection', async (ws) => {
  console.log('Client connected');

  let newPlayer = null;
  //let newPlayerId = 0;
  let playerExists = false;

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if(message.type ==='join'){
      const username = message.username;
      let players = game.players;
      console.log(players)
      for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if(player.username === username){
          // if(player.alive){
            newPlayer = player;
            //newPlayerId = player.id;
            newPlayer.alive = true;
            newPlayer.position.x = 0;
            newPlayer.position.y = 0;
            newPlayer.health = 100;
            playerExists = false;
          // }
          break;
        }
      }

      if(!playerExists){
        //newPlayerId = clientId++;
        newPlayer = new Player(username, username, null, Math.random() * 10, Math.random() * 10, false, ws);
        game.players.push(newPlayer);
      }

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
      console.log(`Player ${username} connected`);
      // console.log(clients)
      //console.log(game.stateJSON())
      // console.log(newPlayer.toJSON())
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
      // console.log('fire');
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
  console.log('Client disconnected');
  const disconnectedClient = clients.find(c => c.ws === ws);
  clients = clients.filter(c => c.ws !== ws);

  if (disconnectedClient) {
    const player = game.findPlayer(disconnectedClient.id);
    if(player){
      player.destroy();
      // for(let i = 0; i < game.players.length; i++){
      //   if(game.players[i] == player){
      //     game.players.splice(i, 1);
      //   }
      // }
    }
    // game.findPlayer(disconnectedClient.id).destroy();
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
