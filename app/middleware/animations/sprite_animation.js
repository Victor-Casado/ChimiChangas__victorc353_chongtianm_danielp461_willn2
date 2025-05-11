// Class for handling sprite animations

// TODO: make child classes
export class SpriteAnimation
{
    constructor(skinNum)
    {
        this.skinNum = skinNum;
        this.paths = {
            'front': SpriteAnimation.getPath(this.skinNum, 'front'),
            'behind': SpriteAnimation.getPath(this.skinNum, 'behind'),
            'right': SpriteAnimation.getPath(this.skinNum, 'right'),
            'left': SpriteAnimation.getPath(this.skinNum, 'left'),
        };
        this.animations = {};
        Object.keys(this.paths).forEach(orientation => {
            this.animations[orientation] = PIXI.Assets.cache.get(this.paths[orientation]).data.animations;
        });
    }

    static getPath(skinNum, orientation){
        return '/public/assets/CharacterPack/animation/character/' + skinNum + '/' + orientation + '/anim.json';
    }

    getTexture(orientation, action = 'Idle'){
        const sprite = PIXI.AnimatedSprite.fromFrames(this.animations[orientation][orientation + action]);
        return sprite.textures;
    }
}