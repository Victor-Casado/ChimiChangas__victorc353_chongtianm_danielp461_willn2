import { Gun } from "../gun.js";

export class M15 extends Gun
{
    constructor(x, y, width='20', height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'M15', 100, 100, 5, 5, 0, 5);
    }

}
