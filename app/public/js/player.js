import { Controller } from './controller.js';

// Class for handling Player
export class Player
{
    constructor(app, client, sprite)
    {
        this.app = app;

        this.walkSpeed = 2;
        this.sprintSpeed = 5;

        // The player's position
        this.position = {
            x: Math.random() * app.screen.width,
            y: Math.random() * app.screen.height,
        };

        // Character movement controller
        this.controller = new Controller();

        this.client = client;
        this.sprite = sprite;

        this.playerHeight = 50;
        this.playerWidth = 30;
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

        // Keep player within bounds
        this.position.x = Math.max(0, Math.min(this.app.screen.width - this.playerWidth, this.position.x));
        this.position.y = Math.max(0, Math.min(this.app.screen.height - this.playerHeight, this.position.y));

        this.sprite.x  = this.position.x;
        this.sprite.y = this.position.y;
    }
}