import {Controller} from './controller.js';

export class Player
{
    constructor(app, id, spriteAnimation, x, y, local, ws, orientation='front', dev=false)
    {
        this.app = app;
        
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
        this.sprite = new PIXI.AnimatedSprite(this.spriteAnimation.getAnimation(this.orientation, 'Idle'));

        this.playerHeight = 50;
        this.playerWidth = 30;

        this.local = local;
        this.dev = dev;
        this.controller = new Controller(local);

        if(local && !dev){
            this.ws = ws;
        }
    }

    async loadSprite(img){
        this.texture = await PIXI.Assets.load(img);
        this.sprite = new PIXI.Sprite(this.texture);
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
    
            this.sprite.textures = this.spriteAnimation.getAnimation(this.orientation, this.animation);
            this.sprite.animationSpeed = (this.animation === '') ? (this.controller.sprint ? 0.5 : 0.3) : 0.1;
        }
    
        this.sprite.play();
        this.sprite.loop = true;
        this.sprite.anchor.set(0.5);
    
        this.position.x = Math.max(0, Math.min(this.app.screen.width - this.playerWidth, this.position.x));
        this.position.y = Math.max(0, Math.min(this.app.screen.height - this.playerHeight, this.position.y));
    
        this.sprite.position.set(this.position.x, this.position.y);
        
        if(this.local && !this.dev){
            this.ws.send(JSON.stringify({
                type: 'move',
                id: this.id,
                x: this.position.x,
                y: this.position.y,
            }));
        }
    }
    

    setPosition(x, y){
        this.sprite.x = x;
        this.sprite.y = y;

        this.position.x = x;
        this.position.y = y;
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
}