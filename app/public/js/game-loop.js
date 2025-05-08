import { Game } from './game.js';

// var players = [];
// var app = new PIXI.Application;

// (async () =>
//     {
//         // Initialize the application
//         await app.init({ background: '#1099bb', resizeTo: window });
    
//         // Append the application canvas to the document body
//         document.body.appendChild(app.canvas);
    
//         // Create and add a container to the stage
//         const container = new PIXI.Container();
    
//         app.stage.addChild(container);

//         // Move the container to the center
//         container.x = 0;
//         container.y = 0;

//         // Center the sprites in local container coordinates
//         container.pivot.x = container.width / 2;
//         container.pivot.y = container.height / 2;

//         // Load the bunny texture
//         const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');

//         document.addEventListener('keydown', function(event) {
//             if (event.key === 'p') {
//             //   const player = loadPlayer(app, 123, new PIXI.Sprite(texture));

//             //   container.addChild(player.sprite);
//             //   players.push(player);
//             loadPlayer(app, 1, new PIXI.Sprite(texture), container)
//             }
//         });
        
//         app.ticker.add(() =>
//             {
//                 players.forEach(player => {
//                     player.updatePosition();
//                 });
//             })

//     })();

const game = await Game.init();

game.loadPlayer(5, 100, 200);

game.startLoop();