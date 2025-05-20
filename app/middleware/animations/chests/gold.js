import { ChestAnimation } from "../chest_animation.js";

export class GoldChest extends ChestAnimation{
    constructor(id, x, y){
        super(id, 'gold', x, y);
    }
}