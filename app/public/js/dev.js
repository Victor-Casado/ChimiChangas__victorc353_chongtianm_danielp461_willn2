import { Player } from '../../middleware/player.js';
import { SpriteAnimation } from '../../middleware/sprite_animation.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    const localPlayerSprite = new SpriteAnimation(1);
    await localPlayerSprite.loadAnimations();

    // const dummyPlayerSprite = new PIXI.AnimatedSprite(dummyFrames);

    const localPlayer = new Player(app, 0, localPlayerSprite, app.screen.width / 2, app.screen.height / 2, true, null, 'front', true);
    // const dummyPlayer = new Player(app, 1, dummyPlayerSprite, app.screen.width / 2 + 30, app.screen.height / 2, false, null, true);
    // container.addChild(dummyPlayer.sprite);

    container.addChild(localPlayer.getSprite());

    container.x = 0;
    container.y = 0;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    app.ticker.add(() => {
        localPlayer.updatePosition();
        // dummyPlayer.updatePosition();
    });
    
})();