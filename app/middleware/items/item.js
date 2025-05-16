export class Item
{
    constructor(x, y, sprite, path, width, height, isHeld)
    {
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
    }

    updateRotation(x, y){
      const newY = this.y - y;
      const newX = this.x - x;
      this.sprite.scale.x = (newX < 0) ? 1 : -1;
      this.sprite.rotation = Math.atan( (newY) / (newX) );
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
