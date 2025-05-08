import { Game } from './game.js';

const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
let game = null;

ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'you') {
        console.log(`You are player ${data.id}`);
        
        game = await Game.init();
        game.startLoop();

        const player = game.loadPlayer(data.id, data.x, data.y);
    }

    if (data.type === 'playerJoined') {
        console.log(`Player ${data.id} joined the lobby`);
        if (game) {
            game.loadPlayer(data.id, data.x, data.y);
        }
    }

};