export class Structure{
    constructor(id, x, y, type, container) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.sprite = this.loadSprite(type);
        this.container = container;

        this.container.addChild(this.sprite);
    }
  
    loadSprite(type) {
        return new PIXI.Sprite(PIXI.Assets.get(Structure.getPath(type)))
    }
    
    static getPath(type){
        // const map = {
        //     'tree': ''
        // }
        return '/public/assets/environment/Texture/tree.png';
    }

    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            type: this.type,
            sprite: this.sprite,
            app: this.app,
        };
    }
}