import { Gun } from "../gun.js";

export class Pistol extends Gun
{
    constructor(id, x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(id, x, y, width, height, isHeld, 'Pistol', 8 * rarity, 100, 5, 12, 500);
        this.rarity = rarity;
    }

}
