import { Game } from '../../middleware/game.js';

// Get room code from URL: /room/:roomCode
const match = window.location.pathname.match(/\/room\/([A-Z0-9]+)/i);
const roomCode = match ? match[1].toUpperCase() : null;

const ws = new WebSocket(`wss://victorcasado.me/ws/${roomCode}`);
let game = null;
let messageQueue = [];

ws.onopen = async () => {
  const res = await fetch('/me');
  const { username } = await res.json();

  ws.send(JSON.stringify({
    type: 'join',
    username: username,
    roomCode: roomCode
  }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (!game) {
        messageQueue.push(data);
    } else {
        handleMessage(data);
    }
};

(async () => {
    game = await Game.clientInit();
    messageQueue.forEach(handleMessage);
    game.startLoop();
    messageQueue = [];
})();

async function handleMessage(data) {
    if (data.type === 'roomFull') {
        alert("Room is full! Please join another room.");
        window.location.href = "/home";
        return;
    }
    if (data.type === 'playerCount') {
        // Update the UI element
        const el = document.getElementById('playerCountDisplay');
        if (el) el.textContent = `${data.count}/${data.max} players in room`;
        return;
    }
    if (data.type === 'you') {
        game.loadState(data.gameState);
        if(!data.player.health){
            data.player.health = 100;
        }
        await game.loadPlayer(data.player.username, data.player.id, 2, data.player.x, data.player.y, true, ws, data.player.orientation, data.player.health);
    }

    if (data.type === 'playerJoined') {
        game.loadPlayer(data.player.username, data.player.id, 2, data.player.x, data.player.y, false, null, data.player.orientation, data.player.health);
    }

    if (data.type === 'existingPlayers') {
        data.clients.forEach(playerData => {
            if(data.localUser !== playerData.username){
                game.loadPlayer(playerData.username, playerData.id, 2, playerData.x, playerData.y, false, null, playerData.orientation, playerData.health);
            }
        });
    }
    if (data.type === 'playerMoved') {
        const mover = game.players.find(p => p.id === data.player.id);
        if(data.player && mover){
            mover.refresh(data.player);
        }
    }
    if (data.type === 'openChest') {
      game.refreshChest(data.chest.id, data.chest.items);
    }

    if (data.type === 'addItem') {
      game.addItem(data.item);
    }

    if (data.type === 'itemState') {
      const items = data.items;
      items.forEach((item) => {
        if(game.items.length > item.id){
            game.items[item.id].refresh(item);
        }
      });
    }

    if (data.type === 'fire') {
        game.items[data.gun.id].fire(data.x, data.y, true, null);
    }

    if (data.type === 'health') {
        const targetPlayer = game.players.find(player => player.id === data.id);
        if (targetPlayer) {
            targetPlayer.health = data.health;
        }
    }

    if (data.type === 'death') {
        const dead = game.players.find(player => player.id === data.id);
        if (dead) {
            game.kill(dead.id);
        }
    }

    if(data.type==='playerDisconnected') {
        game.removePlayer(data.id);
    }
}
