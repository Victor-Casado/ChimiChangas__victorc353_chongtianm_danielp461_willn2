import {Controller} from './controller.js';

export class Player
{
    constructor(id, spriteAnimation, x, y, local, ws=null, orientation='front', dev=false)
    {   
        this.walkSpeed = 2;
        this.sprintSpeed = 3.5;

        this.position = {
            x: x,
            y: y,
        };
        
        this.id = id;
        this.spriteAnimation = spriteAnimation;
        this.orientation = orientation;
        this.animation = 'Idle';
        
        if(spriteAnimation != null){
            this.sprite = new PIXI.AnimatedSprite(this.spriteAnimation.getTexture(this.orientation, 'Idle'));
        }

        this.playerHeight = 50;
        this.playerWidth = 30;

        this.local = local;
        this.dev = dev;
        this.controller = new Controller(local);

        if(!dev){
            this.ws = ws;
        }
    }

    updatePosition(){
        const speed = this.controller.sprint ? this.sprintSpeed : this.walkSpeed;
        let pressed = false;
        let newOrientation = this.orientation;
        let newAnimation = this.animation;
    
        if (this.controller.keys.up.pressed) {
            this.position.y -= speed;
            newOrientation = 'behind';
            newAnimation = '';
            pressed = true;
        }
        if (this.controller.keys.down.pressed) {
            this.position.y += speed;
            newOrientation = 'front';
            newAnimation = '';
            pressed = true;
        }
        if (this.controller.keys.left.pressed) {
            this.position.x -= speed;
            newOrientation = 'left';
            newAnimation = '';
            pressed = true;
        }
        if (this.controller.keys.right.pressed) {
            this.position.x += speed;
            newOrientation = 'right';
            newAnimation = '';
            pressed = true;
        }
    
        if (!pressed) {
            newAnimation = 'Idle';
        }

        if (newOrientation !== this.orientation || newAnimation !== this.animation) {
            this.orientation = newOrientation;
            this.animation = newAnimation;
    
            this.updateOrientation();
        }
    
        this.sprite.position.set(this.position.x, this.position.y);
        
        if(this.local && !this.dev){
            this.ws.send(JSON.stringify({
                type: 'move',
                player: this.toJSON(),
            }));
        }
    }
    
    updateOrientation(){
        const newTextures = this.spriteAnimation.getTexture(this.orientation, this.animation);

        if (this.sprite.textures !== newTextures) {
            this.sprite.textures = newTextures;
            this.sprite.play();
        }

        this.sprite.animationSpeed = (this.animation === '') 
            ? (this.controller.sprint ? 0.5 : 0.3) 
            : 0.1;

        this.sprite.loop = true;
        this.sprite.anchor.set(0.5);
    }
    
    refresh(player) {
        if (this.sprite) {
            this.sprite.x = player.x;
            this.sprite.y = player.y;
    
            const sameOrientation = this.orientation === player.orientation;
            const sameAnimation = this.animation === player.animation;
    
            if (!sameOrientation || !sameAnimation) {
                this.orientation = player.orientation;
                this.animation = player.animation;
                this.updateOrientation();
            }
        }
    
        this.position.x = player.x;
        this.position.y = player.y;
    }

    getSprite(){
        return this.sprite;
    }

    getId(){
        return this.id;
    }

    getPosX(){
        return this.position.x;
    }

    getPosY(){
        return this.position.y;
    }

    isActive(){
        return this.local;
    }
    getSprite(){
        return this.sprite;
    }
    toJSON(){
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y,
            orientation: this.orientation,
            animation: this.animation,
            local: this.local,
        };
    }
}