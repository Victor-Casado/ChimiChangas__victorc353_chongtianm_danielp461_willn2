import { AK47 } from '../items/guns/ak47.js';

// Class for handling chess animations
export class ChestAnimation
{
    constructor(rank, x, y)
    {
        this.rank = rank;
        this.path = ChestAnimation.getPath(this.rank);
        this.items = [new AK47(x, y)];
        this.opened = false;
        this.animation = PIXI.Assets.cache.get(this.path).data.animations;
        this.sprite = PIXI.AnimatedSprite.fromFrames(this.animation['chests']);
        this.position = {
            x: x,
            y: y,
        };
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }

    static getPath(rank){
        return '/public/assets/ChestPack/animation/chest/' + rank + '/chest.json';
    }

    getItemsArray(){
      return this.items;
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
            this.sprite.loop = false;
            this.sprite.onComplete = () => {
                this.items.forEach((item => {
                    item.showSprite();
                }));
            };
            this.sprite.play();
            this.opened = true;
        }
    }
}
