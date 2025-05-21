import { Structure } from './structure.js';
import { Hitbox } from '../hitbox.js';

export class Grass extends Structure{
    constructor(id, x, y, container, variant = 0){
        if(variant == 0){
            variant = Math.floor(Math.random() * (4 + 1)) + 1;
        }
        super(id, x, y, 'grass', container, variant);
        this.collision = false;
        if(this.sprite){
            this.sprite.zIndex = 0;
        }
    }
}

export class Bush extends Structure{
    constructor(id, x, y, container, variant = 0){


        if(variant == 0){
            variant = Math.floor(Math.random() * (5)) + 1;
        }
        super(id, x, y, 'bush', container, variant);
        if(this.sprite){
            const scale = 12;
            const offsetX = (this.sprite.width - this.sprite.width / scale) / 2
            const offsetY = (this.sprite.height - this.sprite.height / scale) / 2
            this.hitbox = new Hitbox(x, y, this.sprite.width / scale, this.sprite.height / scale, offsetX, offsetY);
            this.collision = true;
            this.sprite.zIndex = 10;
            // this.hitbox.makeVisible(this.container);
        }

    }
}

export class Tree extends Structure{
    constructor(id, x, y, container, variant = 0){
        if(variant == 0){
            variant = Math.floor(Math.random() * (2 + 1)) + 1;
        }
        super(id, x, y, 'tree', container, variant);
        if(this.sprite){
            this.hitbox = new Hitbox(x, y, this.sprite.width / 24, this.sprite.height / 2, this.sprite.width / 2 - this.sprite.width / 48, this.sprite.height / 2);
            this.collision = true;
            this.sprite.zIndex = 10;
            // this.hitbox.makeVisible(this.container);
        }
    }
}
