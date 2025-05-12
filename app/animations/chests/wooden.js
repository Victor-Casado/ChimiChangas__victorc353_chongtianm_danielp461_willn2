import { ChestAnimation } from "../chest_animation.js";

export class WoodenChest extends ChestAnimation{
    constructor(x, y){
        super('wooden', x, y);
    }
}