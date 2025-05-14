export class Gun extends Item
{
    constructor(id, sprite, ws=null, dev=false, width='20', height='25', isHeld = false, x, y, damage, range, numBullets, cooldown, bulletSrc, bulletSpeed)
    {
        super(id, sprite, ws=null, dev=false, width='20', height='25', isHeld, x, y)
        this.damage = damage;
        this.range = range;
        this.numBullets = numBullets;
        this.bulletSpeed = bulletSpeed;
        this.cooldown = cooldown;
        this.bulletSrc = bulletSrc;
    }

    toJSON(){
        return {
            id: this.id,
            sprite: this.sprite,
            damage: this.damage,
            range: this.range,
            bulletSpeed: this.bulletSpeed,
            numBullets: this.numBullets,
            cooldown: this.cooldown,
            bulletSrc: this.bulletSrc
        };
    }
}
