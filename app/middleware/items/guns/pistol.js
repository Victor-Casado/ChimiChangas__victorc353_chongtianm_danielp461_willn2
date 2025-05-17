import { Gun } from "../gun.js";

export class Pistol extends Gun
{
    constructor(x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'Pistol', 100 * rarity, 100, 5, 12 / rarity, 500);
    }

}
