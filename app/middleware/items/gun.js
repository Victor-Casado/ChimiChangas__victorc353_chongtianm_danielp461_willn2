import { Item } from "./item.js";

export const bullets = [];

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

    fire(targetX, targetY){
        console.log("BAH");
        const bullet = new Bullet(targetX, targetY, this);

        this.sprite.parent.addChild(bullet.sprite);

        bullets.push(bullet);

        return bullet;
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

export class Bullet {
    constructor(targetX, targetY, gun) {
        const gunSprite = gun.getSprite(); 
        this.x = gunSprite.x;
        this.y = gunSprite.y;

        this.targetX = targetX;
        this.targetY = targetY;

        this.speed = gun.bulletSpeed;  
        this.damage = gun.damage;


        this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE); 
        this.sprite.width = 5;
        this.sprite.height = 5;
        this.sprite.position.set(this.x, this.y);

        this.alive = true; 

        this.maxLife = 60;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const magnitude = Math.hypot(dx, dy);

        this.dirX = dx / magnitude;
        this.dirY = dy / magnitude;

        this.shouldKill = false;

    }

    update(delta) {
        
        const frameSpeed = this.speed * (delta.deltaTime / 60); // Normalize to ~60fps
        this.x += this.dirX * frameSpeed;
        this.y += this.dirY * frameSpeed;

        this.sprite.x = this.x;
        this.sprite.y = this.y;

        this.maxLife -= delta.deltaTime;
        if(this.maxLife < 0){
            this.shouldKill = true;
            // this.destroy();
        }
        if(this.shouldKill){
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
        this.alive = false;
        
    }
}