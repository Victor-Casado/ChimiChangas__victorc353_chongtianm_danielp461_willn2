import { Gun, Bullet, bullets } from "../gun.js";

export class Shotgun extends Gun
{
    constructor(x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(x, y, width, height, isHeld, 'Shotgun', 100 * rarity, 100, 5, 60 / rarity, 500);
        this.automatic = false;
    }
    fire(targetX, targetY) {
        if(this.cooldownCurr < this.cooldown) return;
        console.log("BAH (shotgun)");

        const bulletsFired = [];
        const gunSprite = this.getSprite();

        const spreadCount = 5;        
        const spreadAngle = 30;     
        const angleStep = spreadAngle / (spreadCount - 1);

        const baseAngle = Math.atan2(targetY - gunSprite.y, targetX - gunSprite.x);

        for (let i = 0; i < spreadCount; i++) {
            const offsetDeg = -spreadAngle / 2 + i * angleStep;
            const offsetRad = offsetDeg * (Math.PI / 180);

            const spreadAngleRad = baseAngle + offsetRad;

            const spreadTargetX = gunSprite.x + Math.cos(spreadAngleRad);
            const spreadTargetY = gunSprite.y + Math.sin(spreadAngleRad);

            const bullet = new Bullet(spreadTargetX, spreadTargetY, this, 40);
            this.sprite.parent.addChild(bullet.sprite);
            bullets.push(bullet);
            bulletsFired.push(bullet);
        }
        this.cooldownCurr = 0;
        return bulletsFired;
    }

}
