import { Gun } from "../gun.js";

export class Shotgun extends Gun
{
    constructor(x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'Shotgun', 100 * rarity, 100, 5, 5 / rarity, 5);
    }

}
