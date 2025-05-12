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

function handleMessage(data) {
    const hardCodedUser = 'GUEST';
    if (data.type === 'you') {
        console.log(hardCodedUser);
        game.loadPlayer(hardCodedUser, data.player.id, 1, data.player.x, data.player.y, true, ws, data.player.orientation);
    }

    if (data.type === 'playerJoined') {
        console.log(`Player ${data.player.id} joined the lobby`);
        game.loadPlayer(hardCodedUser, data.player.id, 1, data.player.x, data.player.y, false, null, data.player.orientation);
    }

    if (data.type === 'existingPlayers') {
        console.log("Loading existing players:", data.clients);
        data.clients.forEach(playerData => {
            game.loadPlayer(hardCodedUser, playerData.id, 1, playerData.x, playerData.y, false, null, playerData.orientation);
        });
    }

    if (data.type === 'playerMoved') {
        // console.log("Loading existing players:", data.clients);
        const mover = game.players.find(p => p.id === data.player.id);
        //data.player = UPDATE DATA
        mover.refresh(data.player);
    }
}