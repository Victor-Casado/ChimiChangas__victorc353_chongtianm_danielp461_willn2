import { Player } from '../../middleware/player.js';

(async () =>
    {
        // Create a new application
        const app = new PIXI.Application();
    
        await app.init({ background: '#1099bb', resizeTo: window });
        document.body.appendChild(app.canvas);
    
        const container = new PIXI.Container();
    
        app.stage.addChild(container);

        // Load the bunny texture
        const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');
    
        const localPlayerSprite = new PIXI.Sprite(texture);
        const dummyPlayerSprite = new PIXI.Sprite(texture);

        const localPlayer = new Player(app, 0, localPlayerSprite, app.screen.width / 2, app.screen.height / 2, true, null, true);
        const dummyPlayer = new Player(app, 1, dummyPlayerSprite, app.screen.width / 2 + 30, app.screen.height / 2, false, null, true);
        
        container.addChild(localPlayer.sprite);
        container.addChild(dummyPlayer.sprite);

        container.x = 0;
        container.y = 0;
    
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
    
        app.ticker.add(() =>
        {
            localPlayer.updatePosition();
            dummyPlayer.updatePosition();
        })
    
    })();