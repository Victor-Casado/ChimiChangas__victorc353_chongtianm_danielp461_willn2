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

class Bullet {
    constructor(x, y, direction, gun) {
        this.position = { x, y };

        this.direction = direction;

        this.speed = gun.bulletSpeed;  
        this.damage = gun.damage;


        this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE); 
        this.sprite.width = 5;
        this.sprite.height = 5;
        this.sprite.position.set(x, y);

        this.alive = true; 

        this.maxLife = 2;
    }

    update(delta) {
        this.position.x += this.direction.x * this.speed * delta.deltaTime;
        this.position.y += this.direction.y * this.speed * delta.deltaTime;

        this.sprite.position.set(this.position.x, this.position.y);

        this.maxLife -= delta.deltaTime;
        if(this.maxLife < 0){
            this.desetroy();
        }
    }

    destroy() {
        app.stage.removeChild(this.sprite);
        this.alive = false;
    }
}