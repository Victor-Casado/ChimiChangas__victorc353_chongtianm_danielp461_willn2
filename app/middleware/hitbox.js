export class Hitbox{
  constructor(x, y, width, height, offsetX = 0, offsetY = 0){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  set x(value){
    this.x = value + offsetX;
  }
  set y(value){
    this.y = value + offsetY;
  }
}
