
export class Item
{
    constructor(id, spriteAnimation, ws=null, dev=false, width='20', height='25', range, numBullets, cooldown, damage)
    {
        this.id = id;
        this.range = range;
        this.numBullets = numBullets;
        this.cooldown = cooldown;
        this.damage = damage;
        this.width = width;
        this.height = height;
        this.sprite = new PIXI.AnimatedSprite(spriteAnimation.getTexture(this.orientation, 'Idle'));
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
            damage: this.damage,
            cooldown: this.cooldown,
            range: this.range,
            numBullets: this.numBullets,
            sprite: this.sprite,
        };
    }
}
