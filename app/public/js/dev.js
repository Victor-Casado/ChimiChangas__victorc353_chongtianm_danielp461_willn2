import { Player } from '../../middleware/player.js';
import { Textures } from '../../middleware/textures.js';
import { SpriteAnimation } from '../../middleware/animations/sprite_animation.js';
import { WoodenChest } from '../../middleware/animations/chests/wooden.js';
import { SilverChest } from '../../middleware/animations/chests/silver.js';
import { GoldChest } from '../../middleware/animations/chests/gold.js';
import { DiamondChest } from '../../middleware/animations/chests/diamond.js';
import { Tree, Grass, Bush } from '../../middleware/environment/plant.js';
import { bullets } from '../../middleware/items/gun.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '#78852b', resizeTo: window, antialias: false, antialias: false, // 🔴 Important: disables smoothing
    resolution: window.devicePixelRatio || 1,
    autoDensity: true });

    document.body.appendChild(app.canvas);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    container.x = 0;
    container.y = 0;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    let structures = []

    await Textures.loadAll();

    
    const spriteAnimation = new SpriteAnimation(1);
    const localPlayer = new Player('Topher', 0, spriteAnimation, app.screen.width / 2, app.screen.height / 2, true, null, 'front', true);

    for(let i = 0; i<8; ++i){
        structures.push(new Tree(0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, container));
    }

    for(let i = 0; i<50; ++i){
        structures.push(new Grass(0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, container));
    }

    for(let i = 0; i<15; ++i){
        structures.push(new Bush(0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, container));
    }

    let collTree = new Tree(0, 0, 0, container);

    const chests = [
        new WoodenChest(500, 500),
        new SilverChest(600, 600),
        new GoldChest(300, 300),
        new DiamondChest(400, 400)
    ]

    let items = [];

    chests.forEach((chest => {
        chest.getItemsArray().forEach((item => {
            items.push(item);
            container.addChild(item.getSprite());
        }));
    }));
    
    // player
    

    container.addChild(localPlayer.getSprite());
    chests.forEach((chest => {
        container.addChild(chest.getSprite());
    }));

    const texts = localPlayer.getTexts();

    Object.keys(texts).forEach(text => {
        container.addChild(texts[text]);
    });

    container.setChildIndex(localPlayer.sprite, 0);

    app.ticker.add((delta) => {
        localPlayer.update(structures, chests, items, delta);
        bullets.forEach((bullet, index) => {
            if (bullet.alive) {
                bullet.update(delta);
            } else {
                bullets.splice(index, 1); 
            }
        });
    });

})();
