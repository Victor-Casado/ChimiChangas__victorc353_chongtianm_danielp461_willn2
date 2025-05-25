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
            this.sprite.anchor.set(0.5);
            this.texts = {
                'username': new PIXI.BitmapText({
                                text: username,
                                style: {
                                    fontFamily: 'Verdana',
                                    fontSize: 10,
                                    fill: 0x000000,
                                    align: 'center',
                                }}),
                'chestInteraction': new PIXI.BitmapText({
                                text: '',
                                style: {
                                    fontFamily: 'Verdana',
                                    fontSize: 12,
                                    fill: 0xFFFFFF,
                                    align: 'center',
                                }}),
                'itemInteraction': new PIXI.BitmapText({
                                text: '',
                                style: {
                                    fontFamily: 'Verdana',
                                    fontSize: 12,
                                    fill: 0xFFFFFF,
                                    align: 'center',
                                }}),
            };

            this.healthBarBackground = new PIXI.Graphics();
            this.healthBar = new PIXI.Graphics();

            this.sprite.addChild(this.healthBarBackground);
            this.sprite.addChild(this.healthBar);
            this.updateTextPos();

            this.healthBar.zIndex = 50;
            this.healthBarBackground.zIndex = 50;
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

        // this.health = 100;
        this.collision = !local;
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

    update(structures, chests, items, delta){
        this.updatePosition(structures, delta);
        this.updateChest(chests);
        this.updateItem(items);
        this.inventory.update(delta);
        this.updateGun();
        this.updateHealthBar();
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
    updateHealthBar() {
        const maxWidth = 18; 
        const height = 2;   
        const healthRatio = Math.max(this.health / 100, 0);

        const x = -maxWidth / 2;
        const y = this.sprite.height - 17; 

        this.healthBarBackground.clear();

        this.healthBarBackground.beginFill(0x000000); // black border
        this.healthBarBackground.drawRect(x - 1, y - 1, maxWidth + 2, height + 2); // slightly larger
        this.healthBarBackground.endFill();

        this.healthBarBackground.beginFill(0x8F011B); 
        this.healthBarBackground.drawRect(x, y, maxWidth, height);
        this.healthBarBackground.endFill();

        this.healthBar.clear();
        this.healthBar.beginFill(0x228C22);
        this.healthBar.drawRect(x, y, maxWidth * healthRatio, height);
        this.healthBar.endFill();
    }
    updateGun(){
        if (!this.inventory.length()) return;

        const heldItem = this.inventory.getHoldingItem();

        if (heldItem instanceof Gun && this.controller.clicked) {
            const gun = heldItem;

            // if(gun.cooldownCurr > gun.cooldown){
                
            // }
            gun.fire(this.mouseX, this.mouseY, false, this.ws, this.id);

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
                chest.openChest(true);
                this.ws.send(JSON.stringify({
                    type: 'openChest',
                    chest: chest.toJSON(),
                }));
                const item = chest.items[0];
                console.log("send addItem");
                this.ws.send(JSON.stringify({
                    type: 'addItem',
                    item: item.toJSON(),
                }));
            }
        }
    }

    updateTextPos(){
        this.texts['username'].x = this.position.x - this.playerWidth + this.sprite.width / 2 - 2;
        this.texts['username'].y = this.position.y - this.playerHeight;

        this.texts['chestInteraction'].x = this.position.x - 22;
        this.texts['chestInteraction'].y = this.position.y + 30;

        this.texts['itemInteraction'].x = this.position.x - 22;
        this.texts['itemInteraction'].y = this.position.y + 40;
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

                const inventoryData = player.inventory;
                this.inventory = new Inventory(this);
                this.inventory.updateVisual();

                this.updateHealthBar();

            }

            this.position.x = player.x;
            this.position.y = player.y;

            this.hitbox.x = player.x;
            this.hitbox.y = player.y;

            this.health = player.health;
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
            inventory: this.inventory.toJSON(),
            health: this.health
        };
    }
}
