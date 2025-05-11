// Class for handling sprite animations

// TODO: make child classes
export class SpriteAnimation
{
    constructor(skinNum)
    {
        this.skinNum = skinNum;
        this.paths = {
            'front': this.getPath(skinNum, 'front'),
            'behind': this.getPath(skinNum, 'behind'),
            'right': this.getPath(skinNum, 'right'),
            'left': this.getPath(skinNum, 'left'),
        };
        this.animations = {};
    }

    async loadAnimations(){
        await PIXI.Assets.load([
            this.paths['front'],
            this.paths['behind'],
            this.paths['right'],
            this.paths['left']
        ]);

        Object.keys(this.paths).forEach(orientation => {
            this.animations[orientation] = PIXI.Assets.cache.get(this.paths[orientation]).data.animations;
        });
    }

    getPath(character, orientation){
        return '/public/assets/CharacterPack/animation/character/' + character + '/' + orientation + '/anim.json';
    }

    getAnimation(orientation, action = 'Idle'){
        const sprite = PIXI.AnimatedSprite.fromFrames(this.animations[orientation][orientation + action]);
        return sprite.textures;
    }
}