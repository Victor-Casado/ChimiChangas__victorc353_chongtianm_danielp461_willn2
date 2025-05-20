import { ChestAnimation } from "../chest_animation.js";

export class DiamondChest extends ChestAnimation{
    constructor(id, x, y){
        super(id, 'diamond', x, y);
    }
}