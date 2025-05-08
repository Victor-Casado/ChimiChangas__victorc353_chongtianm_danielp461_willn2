import { Player } from './player.js';

const players = [];

(async () =>
    {
        // Create a new application
        const app = new PIXI.Application();
    
        // Initialize the application
        await app.init({ background: '#1099bb', resizeTo: window });
    
        // Append the application canvas to the document body
        document.body.appendChild(app.canvas);
    
        // Create and add a container to the stage
        const container = new PIXI.Container();
    
        app.stage.addChild(container);

        // Move the container to the center
        container.x = 0;
        container.y = 0;

        // Center the bunny sprites in local container coordinates
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;

        // Load the bunny texture
        const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');

        document.addEventListener('keydown', function(event) {
            if (event.key === 'p') {
              console.log("P pressed");
              const player = loadPlayer(123, new PIXI.Sprite(texture));

              container.addChild(player.sprite);
              players.push(player);
            }
        });
        
        app.ticker.add(() =>
            {
                players.forEach(player => {
                    player.updatePosition();
                });
            })
        
    })();

function loadPlayer(client, sprite){
    return new Player(client, sprite); 
}
