import { ChestAnimation } from "../chest_animation.js";

export class SilverChest extends ChestAnimation{
    constructor(id, x, y){
        super(id, 'silver', x, y);
    }
}