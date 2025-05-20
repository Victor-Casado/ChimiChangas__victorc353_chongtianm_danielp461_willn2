import { Gun } from "./items/gun.js";

export class Inventory{
    constructor(controller){        
        this.inventory = [];
        this.itemHolding = 0;
        this.switchItemCooldown = 0;
        this.droppedCooldown = 0;
        this.maxCapacity = 31231;

        this.controller = controller;
    }

    update(delta){
        if(this.switchItemCooldown <= 0){
            if(this.controller.keys.firstItem.pressed && this.inventory.length > 0){
                this.itemHolding = 0;
                this.switchItemCooldown = 100;
            }
            else if(this.controller.keys.secondItem.pressed && this.inventory.length > 1){
                this.itemHolding = 1;
                this.switchItemCooldown = 100;
            }
            else if(this.controller.keys.thirdItem.pressed && this.inventory.length > 2){
                this.itemHolding = 2;
                this.switchItemCooldown = 100;
            }
        }
        else{
            this.switchItemCooldown -= 10;
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
            if(item instanceof Gun){
                item.cooldownCurr += delta.deltaTime;
            }
            i++;
        }));
    }

    addItem(item){
        if(this.inventory.length == this.maxCapacity){
            this.dropItem(this.itemHolding);
        }
        this.inventory.push(item);
        this.itemHolding = this.inventory.length - 1;
    }

    dropItem(index){
        if(index < 0 || index >= this.inventory.length){
            return;
        }
        if(this.droppedCooldown > 0){
            this.droppedCooldown -= 5;
            return;
        }
        const item = this.inventory[index];
        item.getSprite().visible = true;
        item.isHeld = false;
        this.inventory.splice(index, 1);
        this.droppedCooldown = 200;
    }

    getHoldingItem(){
        return this.inventory[this.itemHolding];
    }

    getInventory(){
        return this.inventory;
    }

    length(){
        return this.inventory.length;
    }
}