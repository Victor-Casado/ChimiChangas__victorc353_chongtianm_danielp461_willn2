import { Gun } from "../gun.js";

export class M15 extends Gun
{
    constructor(id, x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(id, x, y, width, height, isHeld, 'M15', 8 * rarity, 100, 5, 15 , 650); 
        this.rarity = rarity;
    }

}
