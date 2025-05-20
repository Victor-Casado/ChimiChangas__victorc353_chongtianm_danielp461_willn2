import { Item } from "./item.js";
import { Hitbox } from '../hitbox.js';

export const bullets = []; //global bullets array

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
        this.cooldownCurr = cooldown; //timer to detect cooldown readiness
        this.bulletSpeed = bulletSpeed;
        this.automatic = true;
    }

    static getPath(gunName){
        return '/public/assets/weapons/guns/' + gunName + '.png';
    }

    fire(targetX, targetY){
        if(this.cooldownCurr < this.cooldown) return; //ignore fire if cooldown timer hasn't reached appropriate time
        const bullet = new Bullet(targetX, targetY, this);

        this.sprite.parent.addChild(bullet.sprite);

        bullets.push(bullet);

        this.cooldownCurr = 0; //reset timer
        return bullet;
    } 

    toJSON(){
        return {
            type: 'gun',
            gunName: this.gunName,
            x: this.x,
            y: this.y,
            isHeld: this.isHeld,
            rarity: this.rarity,
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

        this.sprite = this.initSprite(gun.gunName);        
        this.sprite.position.set(this.x, this.y);
        this.sprite.visible = false;
        
        this.alive = true; 
        this.expire = gun.range; //max time bullet travels far
        this.lifeSpan = 0; //how long bullet has traveled for (timer variable)

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const magnitude = Math.hypot(dx, dy); //normalize distances

        this.dirX = dx / magnitude;
        this.dirY = dy / magnitude;

        this.shouldKill = false;

        this.hitbox = new Hitbox(this.x, this.y, this.sprite.width, this.sprite.height); //currently does not account for rotation

        this.gun = gun;

        this.sprite.rotation = Math.atan2(dy, dx);
    }

    initSprite(type){
        let sprite = new PIXI.Sprite(PIXI.Assets.get(Bullet.getPath(type))); 
        sprite.anchor.set(0.5);
        return sprite;
    }

    //bullet movement through sky
    update(delta) {
        if(!this.alive){
            return;
        }
        const frameSpeed = this.speed * (delta.deltaTime / 60); //fixed movement speed

        this.x += this.dirX * frameSpeed;
        this.y += this.dirY * frameSpeed;

        this.sprite.x = this.x;
        this.sprite.y = this.y;

        this.lifeSpan += delta.deltaTime;

        if(this.lifeSpan > this.gun.getSprite().width / 7){ //make sprite visible once object reaches gun muzzle
            this.sprite.visible = true;
        }

        if(this.expire < this.lifeSpan){
            this.shouldKill = true;
        }
        if(this.shouldKill){
            this.destroy();
        }

        this.hitbox.x = this.x;
        this.hitbox.y = this.y;

        if(this.lifeSpan / this.expire > 0.8){
            this.sprite.alpha -= 0.1; //fade bullet sprite 
        }
    }

    destroy() {
        this.sprite.destroy();
        this.alive = false;
        
    }

    static getPath(type){
        return '/public/assets/weapons/bullets/' + type + '.png';
    }
}