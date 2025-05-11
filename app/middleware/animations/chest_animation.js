// Class for handling chess animations
export class ChestAnimation
{
    constructor(rank, x, y)
    {
        this.rank = rank;
        this.path = this.getPath();
        this.opened = false;
        this.animation = null;
        this.sprite = null;
        this.position = {
            x: x,
            y: y,
        };
    }

    async init(){
        await PIXI.Assets.load([this.path]);

        this.animation = PIXI.Assets.cache.get(this.path).data.animations;
        this.sprite = PIXI.AnimatedSprite.fromFrames(this.animation['chests']);
        
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }

    getX(){
        return this.position.x;
    }

    getY(){
        return this.position.y;
    }

    getPosition(){
        return this.position;
    }

    getRank(){
        return this.rank;
    }

    getPath(){
        return '/public/assets/ChestPack/animation/chest/' + this.rank + '/chest.json';
    }

    getAnimation(){
        return this.animations[this.rank];
    }

    getSprite(){
        return this.sprite;
    }

    isOpened(){
        return this.isOpened;
    }

    openChest(){
        if (this.sprite) {
            this.sprite.loop = false; // Play only once
            this.sprite.onComplete = () => {
                // ADD WEAPONS HERE
            };
            this.sprite.play();
            this.opened = true;
        }
    }
}