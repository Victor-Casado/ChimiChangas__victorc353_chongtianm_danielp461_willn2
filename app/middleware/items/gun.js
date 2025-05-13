export class Gun extends Item
{
    constructor(id, sprite, ws=null, dev=false, width='20', height='25', isHeld = false, x, y, damage, range, numBullets, cooldown, bulletType)
    {
        super(id, sprite, ws=null, dev=false, width='20', height='25', isHeld, x, y)
        this.damage = damage;
        this.range = range;
        this.numBullets = numBullets;
        this.cooldown = cooldown;
        this.bulletType = bulletType;
    }

    toJSON(){
        return {
            id: this.id,
            sprite: this.sprite,
            damage: this.damage,
            range: this.range,
            numBullets: this.numBullets,
            cooldown: this.cooldown,
            bulletType: this.bulletType
        };
    }
}
