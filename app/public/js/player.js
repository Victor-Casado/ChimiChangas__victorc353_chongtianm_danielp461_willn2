import { Controller } from './controller.js';

//todo: add character width and height; and edit bounds

// Class for handling Player
export class Player
{
    constructor(client, sprite)
    {
        this.walkSpeed = 2;
        this.sprintSpeed = 5;

        // The player's position
        this.position = {
            x: 0, //Math.random() * app.screen.width,
            y: 0, //Math.random() * app.screen.height,
        };

        // Character movement controller
        this.controller = new Controller();

        this.client = client;
        this.sprite = sprite;
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

        // Keep bunny within bounds
        //this.position.x = Math.max(0, Math.min(app.screen.width, this.position.x));
        //this.position.y = Math.max(0, Math.min(app.screen.height, this.position.y));

        this.sprite.x  = this.position.x;
        this.sprite.y = this.position.y;
    }
}