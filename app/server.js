const express = require('express');
const path = require('path');
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];
let clientId = 0;

// import { loadPlayer } from './public/js/player'

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.push(ws);

  const newPlayerId = clientId++;

  console.log(`Player ${newPlayerId} connected`);

  x = Math.random() * 400;
  y = Math.random() * 400;

  clients[newPlayerId] = { x: x, y: y };


  wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
              type: 'playerJoined',
              id: newPlayerId,
              x: x,
              y: y,
          }));
      }
  });

  setTimeout(() => {
    ws.send(JSON.stringify({
        type: 'you',
        id: newPlayerId,
    }));
  }, 100)

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/templates/index.html'));
});

const port = process.env.PORT || 3000

app.listen(port, ()=> {
  console.log('listening on: ', port)
}) 
