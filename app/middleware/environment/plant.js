import { Structure } from './structure.js';
import { Hitbox } from '../hitbox.js';

export class Grass extends Structure{
    constructor(id, x, y, container, variant = 0){
        if(variant == 0){
            variant = Math.floor(Math.random() * (4 + 1)) + 1;
        }
        super(id, x, y, 'grass', container, variant);
        this.collision = false;
    }
}

export class Bush extends Structure{
    constructor(id, x, y, container, variant = 0){
        

        if(variant == 0){
            variant = Math.floor(Math.random() * (5 + 1)) + 1;
        }
        super(id, x, y, 'bush', container, variant);
        this.hitbox = new Hitbox(x, y, this.sprite.width / 2 - 5, this.sprite.height / 2 - 5, this.sprite.width / 2, this.sprite.height / 2 + 7);
        this.collision = true;
    }
}

export class Tree extends Structure{
    constructor(id, x, y, container, variant = 0){
        if(variant == 0){
            variant = Math.floor(Math.random() * (2 + 1)) + 1;
        }
        super(id, x, y, 'tree', container, variant);
        this.hitbox = new Hitbox(x, y, 2, this.sprite.height - 75, this.sprite.width / 2 + 8, 80);
        this.collision = true;
    }
}
