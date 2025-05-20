import {Controller} from './controller.js';
import {Hitbox} from './hitbox.js';
import { Inventory } from './inventory.js';
import {Gun} from './items/gun.js';

export class Player
{
    constructor(username, id, spriteAnimation, x, y, local, ws=null, orientation='front', dev=false, playerWidth='20', playerHeight='25', hitbox = null)
    {
        this.username = username;
        this.walkSpeed = 150;
        this.sprintSpeed = 200;

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
            this.sprite.scale = 1.5;
            this.sprite.zIndex = 3;
            this.texts = {
                'username': new PIXI.BitmapText({
                                text: username,
                                style: {
                                    fontFamily: 'Arial',
                                    fontSize: 10,
                                    fill: 0xff1010,
                                    align: 'center',
                                }}),
                'chestInteraction': new PIXI.BitmapText({
                                text: '',
                                style: {
                                    fontFamily: 'Arial',
                                    fontSize: 24,
                                    fill: 0xff1010,
                                    align: 'center',
                                }}),
                'itemInteraction': new PIXI.BitmapText({
                                text: '',
                                style: {
                                    fontFamily: 'Arial',
                                    fontSize: 24,
                                    fill: 0xff1010,
                                    align: 'center',
                                }})
            };
            this.updateTextPos();

            this.texts.username.zIndex = 50;
            this.texts.chestInteraction.zIndex = 50;
            this.texts.itemInteraction.zIndex = 50;
        }

        this.playerWidth = playerWidth;
        this.playerHeight = playerHeight;

        this.local = local;
        this.dev = dev;
        this.controller = new Controller(local);
        this.numNearbyChest = 0;

        this.mouseX = 0;
        this.mouseY = 0;

        if(hitbox == null){
            if(this.sprite){
                this.hitbox = new Hitbox(x, y, this.sprite.width, this.sprite.height, -this.sprite.width / 2, -this.sprite.height /2);
            } else{
                this.hitbox = new Hitbox(x, y, 20, 20);
            }

        } else{
            this.hitbox = hitbox;
        }
        ;
        if(!dev){
            this.ws = ws;
        }

        this.inventory = new Inventory(this);
    }

    update(structures, chests, items, delta, mouseX, mouseY){
        this.updatePosition(structures, delta);
        this.updateChest(chests);
        this.updateItem(items, mouseX, mouseY);
        this.inventory.update(delta);
        this.updateGun();
    }

    updatePosition(structures, delta){
        const speed = this.controller.sprint ? this.sprintSpeed : this.walkSpeed;

        const oldX = this.position.x;
        const oldY = this.position.y;

        let deltaX = 0;
        let deltaY = 0;

        const frameSpeed = speed * (delta.deltaTime / 60);

        if (this.controller.keys.up.pressed)    deltaY -= frameSpeed;
        if (this.controller.keys.down.pressed)  deltaY += frameSpeed;
        if (this.controller.keys.left.pressed)  deltaX -= frameSpeed;
        if (this.controller.keys.right.pressed) deltaX += frameSpeed;

        let newOrientation = this.orientation;
        let newAnimation = this.animation;
        const pressed = deltaX !== 0 || deltaY !== 0;

        this.position.x += deltaX;
        this.hitbox.x = this.position.x;

        if (Hitbox.collision(this, structures)) {
            this.position.x = oldX;
            this.hitbox.x = oldX;
        }

        this.position.y += deltaY;
        this.hitbox.y = this.position.y;

        if (Hitbox.collision(this, structures)) {
            this.position.y = oldY;
            this.hitbox.y = oldY;
        }


        if(this.inventory.length() == 0){
            if (deltaY < 0) newOrientation = 'behind';
            else if (deltaY > 0) newOrientation = 'front';
            else if (deltaX < 0) newOrientation = 'left';
            else if (deltaX > 0) newOrientation = 'right';
        } else{
            newOrientation = this.inventory.getHoldingItem().orientation;
        }


        if (!pressed) {
            newAnimation = 'Idle';
        } else {
            newAnimation = '';
        }

        if (newOrientation !== this.orientation || newAnimation !== this.animation) {
            this.orientation = newOrientation;
            this.animation = newAnimation;
            this.updateOrientation();
        }

        this.sprite.position.set(this.position.x, this.position.y);
        this.updateTextPos();

        if(this.local && !this.dev){
            this.ws.send(JSON.stringify({
                type: 'move',
                player: this.toJSON(),
            }));
        }
        if(this.hitbox.visualise){
            this.hitbox.update();
        }
}

    updateGun(){
        if (!this.inventory.length()) return;

        const heldItem = this.inventory.getHoldingItem();

        if (heldItem instanceof Gun && this.controller.clicked) {
            const gun = heldItem;

            gun.fire(this.controller.mouseX, this.controller.mouseY, gun);

            if(!gun.automatic) this.controller.clicked = false;
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

    updateChest(chests){
        this.texts['chestInteraction'].text = '';
        this.numNearbyChest = 0;
        chests.forEach((chest => {
            this.checkChest(chest);
        }));
        if(this.numNearbyChest > 0){
            this.texts['chestInteraction'].text = 'Press C';
        }
    }

    updateItem(items, mouseX, mouseY){
        this.texts['itemInteraction'].text = '';
        this.numNearbyItem = 0;
        items.forEach((item => {
            this.checkItem(item);
            if(item.isHeld){
                item.updatePosition(this.position.x, this.position.y, mouseX, mouseY);
            }
        }));
        // make it so that it only gets closest item and put that in itemInteraction text
        if(this.numNearbyItem > 0){
            this.texts['itemInteraction'].text = 'Press E';
        }
    }

    checkItem(item){
        if(!item.isHeld && item.getSprite().visible && this.nearbyItem(item)){
            this.numNearbyItem++;
            if(this.controller.keys.pickUpItem.pressed){
                this.inventory.addItem(item);
            }
        }
    }

    checkChest(chest){
        if(!chest.opened && this.nearbyChest(chest)){
            this.numNearbyChest++;
            if(this.controller.keys.openChest.pressed){
                chest.openChest();
            }
        }
    }

    updateTextPos(){
        this.texts['username'].x = this.position.x - this.playerWidth;
        this.texts['username'].y = this.position.y - this.playerHeight;

        this.texts['chestInteraction'].x = this.position.x;
        this.texts['chestInteraction'].y = this.position.y + 200;

        this.texts['itemInteraction'].x = this.position.x;
        this.texts['itemInteraction'].y = this.position.y + 200;
    }

    refresh(player) {
        if(player){
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
                
                this.itemHolding = player.itemHolding;

                console.log(player.inventory[player.itemHolding]);

                // this.inventory = [];

                // player.inventory.forEach((item) => {
                //     let i;
                //     if(item.type == 'gun'){
                //         const Constructor = gunRegistry[item.gunName];
                //         i = new Constructor(item.x, item.y, null, item.rarity, null, item.isHeld);
                //     }
                //     this.inventory.push(i);
                // })

                // console.log(this.inventory);

                // let i = 0;
                // this.inventory.forEach((item => {
                //     if(this.itemHolding == i){
                //         item.isHeld = true;
                //         item.getSprite().visible = true;

                //         console.log(item);
                //     }
                //     else{
                //         item.isHeld = false;
                //         item.getSprite().visible = false;
                //     }

                //     item.updatePosition(this.position.x, this.position.y, this.controller.mouseX, this.controller.mouseY);
                //     i++;
                // }));
            }

            this.position.x = player.x;
            this.position.y = player.y;

            this.hitbox.x = player.x;
            this.hitbox.y = player.y;

            // this.inventory = player.inventory.map(i => new )

            // console.log(player.inventory);

            

            if(this.texts){
                this.updateTextPos();
            }
        }

    }

    destroy(){
        if(this.sprite){
            this.sprite.destroy();
        }
        if(this.texts){
            Object.values(this.texts).forEach(p => {
                p.destroy();
            });
        }
    }

    nearbyChest(chest){
        const dist = 35;
        if(Math.abs(this.position.x - chest.position.x) < dist && Math.abs(this.position.y - chest.position.y) < dist){
            return true;
        }
        return false;
    }

    nearbyItem(item){
        const dist = 35;
        if(Math.abs(this.position.x - item.x) < dist && Math.abs(this.position.y - item.y) < dist){
            return true;
        }
        return false;
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

    getTexts(){
        return this.texts;
    }

    toJSON(){
        return {
            username: this.username,
            id: this.id,
            x: this.position.x,
            y: this.position.y,
            orientation: this.orientation,
            animation: this.animation,
            local: this.local,
            inventory: this.inventory.inventory.map(i => i.toJSON()),
            itemHolding: this.itemHolding,
        };
    }
}
