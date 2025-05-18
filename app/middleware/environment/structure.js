import {Hitbox} from '../hitbox.js';

export class Structure{
    constructor(id, x, y, type, container, variant = 1) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.variant = variant;
        this.container = container;
        
        if(this.container){
            this.sprite = this.loadSprite(type, variant);
            this.container.addChild(this.sprite);
            this.updatePos();
        }
    }
  
    loadSprite(type, variant) {
        return new PIXI.Sprite(PIXI.Assets.get(Structure.getPath(type, variant)))
    }
    
    static getPath(type, variant){
        return '/public/assets/environment/' + type + variant + '.png';
    }

    updatePos(){
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            type: this.type,
            variant: this.variant,
        };
    }
}