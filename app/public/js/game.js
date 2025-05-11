import { Game } from '../../middleware/game.js';

const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
let game = null;
let players = [];
let player = null;
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

function handleMessage(data) {
    if (data.type === 'you') {
        player = game.loadPlayer(data.id, data.x, data.y, true, ws);
        console.log(`you are ${data.id}`);
    }

    if (data.type === 'playerJoined') {
        console.log(`Player ${data.id} joined the lobby`);
        players.push(game.loadPlayer(data.id, data.x, data.y, false));
    }

    if (data.type === 'existingPlayers') {
        console.log("Loading existing players:", data.clients);
        data.clients.forEach(playerData => {
            players.push(game.loadPlayer(playerData.id, playerData.x, playerData.y, false));
        });
    }

    if (data.type === 'playerMoved') {
        // console.log("Loading existing players:", data.clients);
        const mover = game.players.find(p => p.id === data.id);
        console.log(mover.getId());
        mover.setPosition(data.x, data.y);
    }


}