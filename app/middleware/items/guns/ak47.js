import { Gun } from "../gun.js";

export class AK47 extends Gun
{
    constructor(x, y, width='20', rarity=1, height='25', isHeld = false) //rarity from 1-2
    {
        super(x, y, width, height, isHeld, 'AK47', 100 * rarity, 100, 5, 5 / rarity, 500);
    }

}
