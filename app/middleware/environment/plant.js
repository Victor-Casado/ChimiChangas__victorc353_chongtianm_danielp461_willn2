import { Structure } from './structure.js';

export class Grass extends Structure{
    constructor(id, x, y, container, variant = 0){
        if(variant == 0){
            variant = Math.floor(Math.random() * (4 + 1)) + 1;
        }
        super(id, x, y, 'grass', container, variant);
    }
}

export class Bush extends Structure{
    constructor(id, x, y, container, variant = 0){
        

        if(variant == 0){
            variant = Math.floor(Math.random() * (6 + 1)) + 1;
        }
        super(id, x, y, 'bush', container, variant);
    }
}

export class Tree extends Structure{
    constructor(id, x, y, container, variant = 0){
        

        if(variant == 0){
            variant = Math.floor(Math.random() * (2 + 1)) + 1;
        }
        super(id, x, y, 'tree', container, variant);
    }
}
