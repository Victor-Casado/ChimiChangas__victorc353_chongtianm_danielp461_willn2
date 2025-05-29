import { Gun } from "../gun.js";

export class M24 extends Gun
{
    constructor(id, x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(id, x, y, width, height, isHeld, 'M24', 50 * rarity, 300, 5, 100 / rarity, 600 * rarity);
        this.rarity = rarity;
        this.automatic = false;
    }

}
