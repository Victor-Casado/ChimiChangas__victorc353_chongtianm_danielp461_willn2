import { Controller } from './controller.js';

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
    
        // Create a controller that handles keyboard inputs.
        const controller = new Controller();

        // Load the bunny texture
        //const pathToCharacter = '../assets/CharactersPack/x0.5/American@0.5x.png'
        const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');
    
        const bunny = new PIXI.Sprite(texture);
    
        bunny.x = app.screen.width / 2;
        bunny.y = app.screen.height / 2;
        container.addChild(bunny);
    
        // Move the container to the center
        container.x = 0;
        container.y = 0;
    
        // Center the bunny sprites in local container coordinates
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
    
        // Animate the scene and the character based on the controller's input.
        app.ticker.add(() =>
        {
            const speed = controller.sprint? 5 : 2; // Adjust the movement speed

            if (controller.keys.up.pressed) {
                bunny.y -= speed;
            }
            if (controller.keys.down.pressed) {
                bunny.y += speed;
            }
            if (controller.keys.left.pressed) {
                bunny.x -= speed;
            }
            if (controller.keys.right.pressed) {
                bunny.x += speed;
            }

            // Optional: Keep bunny within bounds
            bunny.x = Math.max(0, Math.min(app.screen.width, bunny.x));
            bunny.y = Math.max(0, Math.min(app.screen.height, bunny.y));
        })
    
    })();
