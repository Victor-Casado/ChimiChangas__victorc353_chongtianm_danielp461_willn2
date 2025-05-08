import { Player } from './player.js';

export class Game {
    constructor(app, texture) {
      this.app = app;
      this.container = new PIXI.Container();
      this.texture = texture;
  
      document.body.appendChild(this.app.canvas);
      this.app.stage.addChild(this.container);
  
      this.container.x = 0;
      this.container.y = 0;
      this.container.pivot.x = this.container.width / 2;
      this.container.pivot.y = this.container.height / 2;

      this.players = [];
    }
  
    static async init() {
      const app = new PIXI.Application();
      await app.init({ background: '#1099bb', resizeTo: window });
  
      const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');
  
      return new Game(app, texture);
    }

    loadPlayer(id, x, y){
        const player = new Player(this.app, id, new PIXI.Sprite(this.texture), x, y);
    
        this.container.addChild(player.sprite);
        // player.sprite.x = x;
        // player.sprite.y = y;
        this.players.push(player);
        return player
    }

    startLoop() {
        this.app.ticker.add(() => {
            this.players.forEach(player => {
                player.updatePosition(); 
            });
        });
    }
  }