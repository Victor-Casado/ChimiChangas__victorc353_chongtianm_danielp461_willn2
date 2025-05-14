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
