const express = require('express');
const path = require('path');
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];
let clientId = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');

  const newPlayerId = clientId++;
  console.log(`Player ${newPlayerId} connected`);

  const x = Math.random() * 400;
  const y = Math.random() * 400;

  

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

  wss.clients.forEach(client => {
    
      if (client.readyState === WebSocket.OPEN && client != ws) {
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
      // console.log(`${message.id} moved`);
      c = clients.find(p => p.id === message.id)
      c.x = message.x;
      c.y = message.y;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client != ws) {
          client.send(JSON.stringify({
              type: 'playerMoved',
              id: message.id,
              x: message.x,
              y: message.y,
          }));
        }
      })
    }
  });
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
