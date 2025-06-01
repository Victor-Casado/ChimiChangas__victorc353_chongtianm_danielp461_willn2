import { Gun } from "../gun.js";

export class AK47 extends Gun
{
    constructor(id, x, y, width='20', rarity=1, height='25', isHeld = false) //rarity from 1-2
    {
        super(id, x, y, width, height, isHeld, 'AK47', 15 * rarity, 100, 5, 20, 500);
        this.rarity = rarity;
    }

}
