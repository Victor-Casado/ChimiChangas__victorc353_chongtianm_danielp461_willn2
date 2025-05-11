import { ChestAnimation } from "../chest_animation.js";

export class GoldChest extends ChestAnimation{
    constructor(x, y){
        super('gold', x, y);
    }
}