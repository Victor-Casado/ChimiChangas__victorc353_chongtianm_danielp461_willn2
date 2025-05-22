import { Player } from '../../middleware/player.js';
import { Textures } from '../../middleware/textures.js';
import { SpriteAnimation } from '../../middleware/animations/sprite_animation.js';
import { WoodenChest } from '../../middleware/animations/chests/wooden.js';
import { SilverChest } from '../../middleware/animations/chests/silver.js';
import { GoldChest } from '../../middleware/animations/chests/gold.js';
import { DiamondChest } from '../../middleware/animations/chests/diamond.js';
import { Tree, Grass, Bush } from '../../middleware/environment/plant.js';
import { bullets } from '../../middleware/items/gun.js';
import { Hitbox } from '../../middleware/hitbox.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '#78852b', resizeTo: window, antialias: false, antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true });

    document.body.appendChild(app.canvas);

    const container = new PIXI.Container();
    container.sortableChildren = true;
    app.stage.addChild(container);

    

    container.x = 0;
    container.y = 0;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    let structures = []

    await Textures.loadAll();

    
    const spriteAnimation = new SpriteAnimation(1);
    const localPlayer = new Player('Topher', 0, spriteAnimation, app.screen.width / 2, app.screen.height / 2, true, null, 'front', true);
    // localPlayer.sprite.anchor.set(0.5);
    // localPlayer.hitbox.visualise(container);
    for(let i = 0; i<8; ++i){
        let tree = new Tree(0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, container);
        // tree.hitbox.visualise(container);
        structures.push(tree);
    }

    for(let i = 0; i<50; ++i){
        structures.push(new Grass(0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, container));
    }

    for(let i = 0; i<15; ++i){
        let bush = new Bush(0, Math.random() * window.innerWidth, Math.random() * window.innerHeight, container);
        // bush.hitbox.visualise(container);
        structures.push(bush);
    }

    let collTree = new Tree(0, 0, 0, container);

    const chests = [
        new WoodenChest(0, 500, 500),
        new SilverChest(0, 600, 600),
        new GoldChest(0, 300, 300),
        new DiamondChest(0, 400, 400)
    ]

    let items = [];

    chests.forEach((chest => {
        chest.getItemsArray().forEach((item => {
            items.push(item);
            container.addChild(item.getSprite());
        }));
    }));
    
    chests.forEach((chest => {
        container.addChild(chest.getSprite());
    }));

    container.addChild(localPlayer.getSprite());
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
            if(Hitbox.collision(bullet, structures)){
                console.log("bang");
                bullet.shouldKill = true;
            }
        });
    });

})();
