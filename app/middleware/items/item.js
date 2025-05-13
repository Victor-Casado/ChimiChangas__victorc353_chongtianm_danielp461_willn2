
export class Item
{
    constructor(id, sprite, ws=null, dev=false, width='20', height='25', isHeld=false, x, y)
    {
        this.id = id;
        this.x = x;
        this.y = y;
        this.isHeld = isHeld;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
        this.dev = dev;

        if(!dev){
            this.ws = ws;
        }
    }


    getSprite(){
        return this.sprite;
    }

    getId(){
        return this.id;
    }

    toJSON(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            isHeld: this.isHeld,
            sprite: this.sprite,
        };
    }
}
