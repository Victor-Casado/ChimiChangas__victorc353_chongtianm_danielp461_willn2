
export class Item
{
    constructor(id, sprite, ws=null, dev=false, width='20', height='25')
    {
        this.id = id;
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

    getSprite(){
        return this.sprite;
    }
    toJSON(){
        return {
            id: this.id,
            sprite: this.sprite,
        };
    }
}
