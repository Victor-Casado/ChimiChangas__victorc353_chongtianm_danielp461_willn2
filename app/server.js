const express = require('express');
const path = require('path');
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

// import { loadPlayer } from './public/js/player'

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.push(ws);

  // loadPlayer(app, ws, new PIXI.Sprite(texture), container)

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message); 
      }
    });
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
