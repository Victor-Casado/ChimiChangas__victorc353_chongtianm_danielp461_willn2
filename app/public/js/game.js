import { Game } from '../../middleware/game.js';
import { Grass,Bush,Tree } from '../../middleware/environment/plant.js';

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

function handleMessage(data) {
    // console.log(data);
    if (data.type === 'you') {
        game.loadState(data.gameState);
        game.loadPlayer(data.player.username, data.player.id, 2, data.player.x, data.player.y, true, ws, data.player.orientation);
    }

    if (data.type === 'playerJoined') {
        console.log(`Player ${data.player.id} joined the lobby`);
        game.loadPlayer(data.player.username, data.player.id, 2, data.player.x, data.player.y, false, null, data.player.orientation);
    }

    if (data.type === 'existingPlayers') {
        console.log("Loading existing players:", data.clients);
        data.clients.forEach(playerData => {
            if(data.localUser !== playerData.username){
                console.log('local user:', data.localUser);
                console.log('player data:', playerData.username);
                game.loadPlayer(playerData.username, playerData.id, 2, playerData.x, playerData.y, false, null, playerData.orientation);
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
      console.log(data.chest);
      game.refreshChest(data.chest.id, data.chest.items);
    }
    if(data.type==='playerDisconnected') {
        console.log("PLAYER DC");
        game.removePlayer(data.id);
    }
}
