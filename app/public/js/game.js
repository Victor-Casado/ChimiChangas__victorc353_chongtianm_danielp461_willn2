import { Game } from '../../middleware/game.js';

const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
let game = null;
let messageQueue = [];

ws.onopen = async () => {
  const res = await fetch('/me');
  const { username } = await res.json();

  ws.send(JSON.stringify({
    type: 'join',
    username: username
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

game = await Game.clientInit();

messageQueue.forEach(handleMessage);
game.startLoop();
messageQueue = [];

async function handleMessage(data) {
    // console.log(data);
    if (data.type === 'you') {
        //console.log("=== Incoming YOU player data ===");
        //console.log("Your player:", data.player);
        game.loadState(data.gameState);
        if(!data.player.health){
            data.player.health = 100;
        }
        await game.loadPlayer(data.player.username, data.player.id, 2, data.player.x, data.player.y, true, ws, data.player.orientation, data.player.health);
    }

    if (data.type === 'playerJoined') {
        //console.log(`Player ${data.player.id} joined the lobby`);
        game.loadPlayer(data.player.username, data.player.id, 2, data.player.x, data.player.y, false, null, data.player.orientation, data.player.health);
    }

    if (data.type === 'existingPlayers') {
        //console.log("=== Incoming existingPlayers data ===");
        //console.log("localUser:", data.localUser);
        //console.log("All players:", data.clients.map(p => ({ username: p.username, id: p.id, x: p.x, y: p.y })));

        //console.log("Loading existing players:", data.clients);
        data.clients.forEach(playerData => {
          //console.log("Player from server:", playerData);
            if(data.localUser !== playerData.username){
                //console.log('local user:', data.localUser);
                //console.log('player data:', playerData.username);
                game.loadPlayer(playerData.username, playerData.id, 2, playerData.x, playerData.y, false, null, playerData.orientation, playerData.health);
            }
        });
    }
    if (data.type === 'playerMoved') {
        // console.log("Loading existing players:", data.clients);
        const mover = game.players.find(p => p.id === data.player.id);
        //data.player = UPDATE DATA
        // console.log(data.player);
        // console.log('playerMoved: ' + data.player);
        if(data.player && mover){
            mover.refresh(data.player);
        }
    }
    if (data.type === 'openChest') {
    //  console.log(data.chest);
      game.refreshChest(data.chest.id, data.chest.items);
    }

    if (data.type === 'addItem') {
    //   console.log(data.item);
      game.addItem(data.item);
    }

    if (data.type === 'itemState') {
      const items = data.items;
      items.forEach((item) => {
        // console.log(item);
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
        //console.log("PLAYER DC");
        game.removePlayer(data.id);
    }
}
