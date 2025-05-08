import { Game } from './game.js';

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

game = await Game.init();
game.startLoop();

messageQueue.forEach(handleMessage);
messageQueue = [];

function handleMessage(data) {
    if (data.type === 'you') {
        game.loadPlayer(data.id, data.x, data.y, true);
        console.log(`you are ${data.id}`);
    }

    if (data.type === 'playerJoined') {
        console.log(`Player ${data.id} joined the lobby`);
        game.loadPlayer(data.id, data.x, data.y, false);
    }

    if (data.type === 'existingPlayers') {
        console.log("Loading existing players:", data.clients);
        data.clients.forEach(playerData => {
            game.loadPlayer(playerData.id, playerData.x, playerData.y, false);
        });
    }
}