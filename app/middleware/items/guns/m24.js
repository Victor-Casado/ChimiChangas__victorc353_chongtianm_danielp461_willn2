import { Gun } from "../gun.js";

export class M24 extends Gun
{
    constructor(x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'M24', 100 * rarity, 300, 5, 100 / rarity, 600);
        this.automatic = false;
    }

}
