export const items = [];

export class Item
{
    constructor(id, x, y, sprite, path, width, height, isHeld)
    {
        this.id = id;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.hideSprite();
        this.path = path;
        this.width = width;
        this.height = height;
        this.isHeld = isHeld;
        this.orientation = 'right'
        this.sprite.pivot.set(-5, 5);
    }

    updateRotation(x, y){ //point toward (x, y) and tell player which way to orientate
        const newY = this.y - y;
        const newX = this.x - x;
        this.sprite.scale.x = (newX < 0) ? 1 : -1;
        const angle = Math.atan( (newY) / (newX) );
        this.sprite.rotation = angle;

        const deg = angle * (180 / Math.PI); 
        
        if(newX < 0){
            if(deg > 45 && deg < 90){
                this.orientation = 'front';
                this.sprite.zIndex = 5;
            }
            else if(deg < 45 && deg > -45){
                this.orientation = 'right';
                this.sprite.zIndex = 5;
            } 
            else if(deg < -45 && deg > -90){
                this.orientation = 'behind';
                this.sprite.zIndex = 1;
            }
        } else{
            if(deg > 45 && deg < 90){
                this.orientation = 'behind';
                this.sprite.zIndex = 1;
            }
            else if(deg < 45 && deg > -45){
                this.orientation = 'left';
                this.sprite.zIndex = 5;
            } 
            else if(deg < -45 && deg > -90){
                this.orientation = 'front';
                this.sprite.zIndex = 5;
            }
        }
        
    }

    updatePosition(x, y, mouseX, mouseY){
        this.x = x;
        this.y = y;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.updateRotation(mouseX, mouseY);
    }


    getSprite(){
        return this.sprite;
    }

    hideSprite(){
        this.sprite.visible = false;
    }

    showSprite(){
        this.sprite.visible = true;
    }

    getId(){
        return this.id;
    }

    toJSON(){
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            isHeld: this.isHeld,
        };
    }
}
