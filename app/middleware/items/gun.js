import { Item } from "./item.js";

export class Gun extends Item
{
    constructor(x, y, width, height, isHeld, gunName, damage, range, numBullets, cooldown, bulletSpeed)
    {
        super(x, y, new PIXI.Sprite(PIXI.Assets.get(Gun.getPath(gunName))), Gun.getPath(gunName), width, height, isHeld);
        this.gunName = gunName;
        this.damage = damage;
        this.range = range;
        this.numBullets = numBullets;
        this.cooldown = cooldown;
        this.bulletSpeed = bulletSpeed;
    }

    static getPath(gunName){
        return '/public/assets/GunsPack/Guns/' + gunName + '.png';
    }

    toJSON(){
        return {
            damage: this.damage,
            range: this.range,
            bulletSpeed: this.bulletSpeed,
            numBullets: this.numBullets,
            cooldown: this.cooldown,
        };
    }
}
