import { ChestAnimation } from "../chest_animation.js";

export class WoodenChest extends ChestAnimation{
    constructor(id, x, y){
        super(id, 'wooden', x, y);
    }
}