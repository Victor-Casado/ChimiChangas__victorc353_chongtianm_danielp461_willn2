import { Gun, Bullet, bullets } from "../gun.js";

export class Shotgun extends Gun
{
    constructor(id, x, y, width='20', rarity=1, height='25', isHeld = false)
    {
        super(id, x, y, width, height, isHeld, 'Shotgun', 5 * rarity, 50, 5, 60 / rarity, 700 * rarity);
        this.rarity = rarity;
        this.automatic = false;
    }

    //specialized fire method to handle shotgun spread
    fire(targetX, targetY, absolute, ws, shotBy) {
        if(this.cooldownCurr < this.cooldown && !absolute) return;
        
        if(ws){
            ws.send(JSON.stringify({
                type: 'fire',
                gun: this.toJSON(),
                x: targetX,
                y: targetY,
            }));
        }

        const bulletsFired = [];
        const gunSprite = this.getSprite();

        const spreadCount = 8;        
        const spreadAngle = 25;     
        const angleStep = spreadAngle / (spreadCount - 1);

        const baseAngle = Math.atan2(targetY - gunSprite.y, targetX - gunSprite.x);

        for (let i = 0; i < spreadCount; i++) {
            const offsetDeg = -spreadAngle / 2 + i * angleStep;
            const offsetRad = offsetDeg * (Math.PI / 180);

            const spreadAngleRad = baseAngle + offsetRad;

            const spreadTargetX = gunSprite.x + Math.cos(spreadAngleRad);
            const spreadTargetY = gunSprite.y + Math.sin(spreadAngleRad);

            const bullet = new Bullet(spreadTargetX, spreadTargetY, this, shotBy);
            this.sprite.parent.addChild(bullet.sprite);
            bullets.push(bullet);
            bulletsFired.push(bullet);
        }
        this.cooldownCurr = 0;
        return bulletsFired;
    }

}
