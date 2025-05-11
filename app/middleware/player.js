import {Controller} from './controller.js';

export class Player
{
    constructor(id, x, y, local, ws)
    {

        this.walkSpeed = 2;
        this.sprintSpeed = 5;
        this.texture = null;

        this.position = {
            x: x,
            y: y,
        };
        
        this.id = id;
        this.sprite = null;

        this.playerHeight = 50;
        this.playerWidth = 30;

        this.local = local;
        this.controller = new Controller(local);

        if(local){
            this.ws = ws;
        }
    }

    async loadSprite(img){
        this.texture = await PIXI.Assets.load(img);
        this.sprite = new PIXI.Sprite(this.texture);
    }

    updatePosition(){
        const speed = this.controller.sprint? this.sprintSpeed : this.walkSpeed; // Adjust the movement speed

        if (this.controller.keys.up.pressed) {
            this.position.y -= speed;
        }
        if (this.controller.keys.down.pressed) {
            this.position.y += speed;
        }
        if (this.controller.keys.left.pressed) {
            this.position.x -= speed;
        }
        if (this.controller.keys.right.pressed) {
            this.position.x += speed;
        }

        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        
        if(this.local){
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