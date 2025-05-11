import { Player } from '../../middleware/player.js';
import { Textures } from '../../middleware/textures.js';
import { SpriteAnimation } from '../../middleware/animations/sprite_animation.js';
import { WoodenChest } from '../../middleware/animations/chests/wooden.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    await Textures.loadAll();

    // chest animation load
    const woodenChest = new WoodenChest(100, 100);

    // sprite animation load
    const spriteAnimation = new SpriteAnimation(1);

    // player
    const localPlayer = new Player(0, spriteAnimation, app.screen.width / 2, app.screen.height / 2, true, null, 'front', true);

    container.addChild(localPlayer.getSprite());
    container.addChild(woodenChest.getSprite());

    container.x = 0;
    container.y = 0;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    app.ticker.add(() => {
        localPlayer.updatePosition();
        if(Math.abs(localPlayer.position.x - woodenChest.position.x) < 50 && Math.abs(localPlayer.position.y - woodenChest.position.y) < 50){
            woodenChest.openChest();
        }
    });
    
})();