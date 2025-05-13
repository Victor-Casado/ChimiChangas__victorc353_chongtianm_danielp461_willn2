import { Game } from '../../middleware/game.js';

const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
let game = null;
let messageQueue = [];

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (!game) {
        messageQueue.push(data);
    } else {
        handleMessage(data);
    }
};

game = await Game.clientInit();
game.startLoop();

messageQueue.forEach(handleMessage);
messageQueue = [];

var user = 'Guest';

async function fetchUsername(){
    await fetch('../../me')
    .then(res => res.json())
    .then(data => {
        user = data.username;
    })
    .catch(err => {
        console.error('Error fetching /me:', err);
    });
}


async function handleMessage(data) {
    await fetchUsername();
    if (data.type === 'you') {
        game.loadPlayer(user, data.player.id, 1, data.player.x, data.player.y, true, ws, data.player.orientation);
    }

    if (data.type === 'playerJoined') {
        console.log(`Player ${data.player.id} joined the lobby`);
        game.loadPlayer(user, data.player.id, 1, data.player.x, data.player.y, false, null, data.player.orientation);
    }

    if (data.type === 'existingPlayers') {
        console.log("Loading existing players:", data.clients);
        data.clients.forEach(playerData => {
            game.loadPlayer(user, playerData.id, 1, playerData.x, playerData.y, false, null, playerData.orientation);
        });
    }

    if (data.type === 'playerMoved') {
        // console.log("Loading existing players:", data.clients);
        const mover = game.players.find(p => p.id === data.player.id);
        //data.player = UPDATE DATA
        mover.refresh(data.player);
    }
}