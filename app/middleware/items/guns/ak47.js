import { Gun } from "../gun.js";

export class AK47 extends Gun
{
    constructor(x, y, width='20', height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'AK47', 100, 100, 5, 5, 0, 5);
    }

}
