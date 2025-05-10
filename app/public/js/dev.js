import { Player } from '../../middleware/player.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    // Load your sprite sheet
    const sheetTexture = await PIXI.Assets.load('/public/assets/CharactersPack/sprite/free_character_1-3.png');

    const baseTexture = sheetTexture.baseTexture;
    const frameWidth = 32;
    const frameHeight = 32;

    // Helper to extract animation frames for one direction of one character
    function getAnimationFrames(characterIndex = 0, direction = 0) {
        const frames = [];
        const cols = 3;
        const rows = 4;
        const charsPerRow = 4; // 4 characters in this sprite sheet

        const xStart = (characterIndex % charsPerRow) * cols * frameWidth;
        const yStart = direction * frameHeight;

        for (let i = 0; i < cols; i++) {
            const rect = new PIXI.Rectangle(xStart + i * frameWidth, yStart, frameWidth, frameHeight);
            frames.push(new PIXI.Texture(baseTexture, rect));
        }
        return frames;
    }

    const localFrames = getAnimationFrames(0, 0);
    const dummyFrames = getAnimationFrames(1, 0);

    const localPlayerSprite = new PIXI.AnimatedSprite(localFrames);
    localPlayerSprite.animationSpeed = 0.15;
    localPlayerSprite.play();

    const dummyPlayerSprite = new PIXI.AnimatedSprite(dummyFrames);
    dummyPlayerSprite.animationSpeed = 0.15;
    dummyPlayerSprite.play();

    const localPlayer = new Player(app, 0, localPlayerSprite, app.screen.width / 2, app.screen.height / 2, true, null, true);
    const dummyPlayer = new Player(app, 1, dummyPlayerSprite, app.screen.width / 2 + 30, app.screen.height / 2, false, null, true);

    container.addChild(localPlayer.sprite);
    container.addChild(dummyPlayer.sprite);

    container.x = 0;
    container.y = 0;

    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    app.ticker.add(() => {
        localPlayer.updatePosition();
        dummyPlayer.updatePosition();
    });
})();
