import { Gun } from "../gun.js";

export class M24 extends Gun
{
    constructor(x, y, width='20', height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'M24', 100, 100, 5, 5, 0, 5);
    }

}
