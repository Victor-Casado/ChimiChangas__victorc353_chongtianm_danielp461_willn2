import {Controller} from './controller.js';
import {Hitbox} from './hitbox.js';
import {Gun, Bullet} from './items/gun.js';

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
        }

        this.texts.username.zIndex = 50;
        this.texts.chestInteraction.zIndex = 50;
        this.texts.itemInteraction.zIndex = 50;

        this.playerWidth = playerWidth;
        this.playerHeight = playerHeight;

        this.local = local;
        this.dev = dev;
        this.controller = new Controller(local);
        this.itemHolding = 0;
        this.numNearbyChest = 0;
        this.numNearbyItem = 0;
        this.switchItemCooldown = 0;
        this.droppedCooldown = 0;

        this.inventory = [];

        if(hitbox == null){
            if(this.sprite){
                this.hitbox = new Hitbox(x, y, this.sprite.width, this.sprite.height);
            } else{
                this.hitbox = new Hitbox(x, y, 20, 20);
            }

        } else{
            this.hitbox = hitbox;
        }

        if(!dev){
            this.ws = ws;
        }
    }

    update(structures, chests, items, delta){
        this.updatePosition(structures, delta);
        this.updateChest(chests);
        this.updateItem(items);
        this.updateInventory();
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


        if(this.inventory.length == 0){
            if (deltaY < 0) newOrientation = 'behind';
            else if (deltaY > 0) newOrientation = 'front';
            else if (deltaX < 0) newOrientation = 'left';
            else if (deltaX > 0) newOrientation = 'right';
        } else{
            newOrientation = this.inventory[this.itemHolding].orientation;
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
}

    updateGun(){
        if (!this.inventory.length) return;

        const heldItem = this.inventory[this.itemHolding];

        // Check if it's a Gun instance and the mouse was clicked
        if (heldItem instanceof Gun && this.controller.clicked) {
            const gun = heldItem;

            gun.fire(this.controller.mouseX, this.controller.mouseY, gun);

            this.controller.clicked = false;
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

    updateInventory(){
        if(this.controller.keys.switchItem.pressed && this.switchItemCooldown <= 0){
            this.itemHolding = (this.itemHolding + 1) % this.inventory.length;
            this.switchItemCooldown = 200;
        }
        if(this.switchItemCooldown > 0){
            this.switchItemCooldown -= 8;
        }
        let i = 0;
        this.inventory.forEach((item => {
            if(this.itemHolding == i){
                item.isHeld = true;
                item.getSprite().visible = true;
            }
            else{
                item.isHeld = false;
                item.getSprite().visible = false;
            }
            item.updatePosition(this.position.x, this.position.y, this.controller.mouseX, this.controller.mouseY);
            i++;
        }));
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

    updateItem(items){
        this.texts['itemInteraction'].text = '';
        this.numNearbyItem = 0;
        items.forEach((item => {
            this.checkItem(item);
        }));
        // make it so that it only gets closest item and put that in itemInteraction text
        if(this.numNearbyItem > 0){
            this.texts['itemInteraction'].text = 'Press E';
        }
    }

    dropItem(index){
        if(index < 0 || index >= this.inventory.length){
            return;
        }
        if(this.droppedCooldown <= 0){
            const item = this.inventory[index];
            item.getSprite().visible = true;
            item.isHeld = false;
            this.inventory.splice(index, 1);
        }
        else{
            this.droppedCooldown -= 200;
        }
    }

    checkItem(item){
        if(!item.isHeld && item.getSprite().visible && this.nearbyItem(item)){
            this.numNearbyItem++;
            if(this.controller.keys.pickUpItem.pressed){
                if(this.inventory.length == 3){
                    this.dropItem(this.itemHolding);
                }
                this.inventory.push(item);
                this.itemHolding = this.inventory.length - 1;
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
            }

            this.position.x = player.x;
            this.position.y = player.y;

            this.hitbox.x = player.x;
            this.hitbox.y = player.y;
        }

    }

    destroy(){
        if(this.sprite){
            this.sprite.destroy();
        }
        if(this.texts){
            console.log(this.texts);
            // console.log(this.texts.values());
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
        const dist = 30;
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
        };
    }
}
