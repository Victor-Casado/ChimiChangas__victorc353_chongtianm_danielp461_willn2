import {Controller} from './controller.js';
import {Hitbox} from './hitbox.js';

export class Player
{
    constructor(username, id, spriteAnimation, x, y, local, ws=null, orientation='front', dev=false, playerWidth='20', playerHeight='25', hitbox = null)
    {
        this.username = username;
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

        if(hitbox == null){
          this.hitbox = new Hitbox(x, y, 20, 25);
        }

        if(spriteAnimation != null){
            this.sprite = new PIXI.AnimatedSprite(this.spriteAnimation.getTexture(this.orientation, 'Idle'));
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

        this.playerWidth = playerWidth;
        this.playerHeight = playerHeight;

        this.local = local;
        this.dev = dev;
        this.controller = new Controller(local);
        this.itemHolding = 0;
        this.numNearbyChest = 0;
        this.numNearbyItem = 0;

        this.inventory = [];

        if(!dev){
            this.ws = ws;
        }
    }

    update(chests, items){
        this.updatePosition();
        this.updateChest(chests);
        this.updateItem(items);
        this.updateInventory();
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
        this.updateTextPos();

        if(this.local && !this.dev){
            this.ws.send(JSON.stringify({
                type: 'move',
                player: this.toJSON(),
            }));
        }

        this.hitbox.x = this.position.x;
        this.hitbox.y = this.position.y;
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
        if(this.controller.keys.switchItem.pressed){
            this.itemHolding = this.itemHolding >= this.inventory.length ? 0 : this.itemHolding + 1;
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
            item.getSprite().x = this.position.x;
            item.getSprite().y = this.position.y;
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
            // this.texts['chestInteraction'].text = 'Press C to open chest';
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
            // this.texts['itemInteraction'].text = 'Press E to pick up item';
        }
    }

    checkItem(item){
        if(!item.isHeld && item.getSprite().visible && this.nearbyItem(item)){
            this.numNearbyItem++;
            if(this.controller.keys.pickUpItem.pressed){
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

    collision(obj){
      let player = this.hitbox;
      let other = obj.sprite.getBounds();

      return player.x + player.width > other.x &&
              player.x < other.x + other.width &&
              player.y + player.height > other.y &&
              player.y < other.y + other.height;
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
