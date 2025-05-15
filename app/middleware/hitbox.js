export class Hitbox{
  constructor(x, y, width, height, offsetX = 0, offsetY = 0){
    this._x = x;
    this._y = y;
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  set x(value){
    this._x = value;
  }
  set y(value){
    this._y = value;
  }

  get x() {
    return this._x + this.offsetX;
  }

  get y() {
    return this._y + this.offsetY;
  }

  static collision(obj1, others){
      let a = obj1.hitbox;

      for(var obj2 of others){
        if(obj2.collision){
          let b = obj2.hitbox;
          const collide = a.x + a.width > b.x &&
                  a.x < b.x + b.width &&
                  a.y + a.height > b.y &&
                  a.y < b.y + b.height;

          if(collide) return true;
        }
        
      }
      

      return false;
    }
}
