import { Gun } from "../gun.js";

export class Pistol extends Gun
{
    constructor(x, y, width='20', height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'Pistol', 100, 100, 5, 5, 0, 5);
    }

}
