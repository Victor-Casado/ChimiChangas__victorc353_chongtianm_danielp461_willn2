import { Structure } from './structure.js';

export class Tree extends Structure{
    constructor(id, x, y, type, container, variant = 0){
        

        if(variant == 0){
            variant = Math.floor(Math.random() * (2 + 1)) + 1;
        }
        super(id, x, y, type, container, variant);
    }
}