import {Player} from './player.js';
import {SpriteAnimation} from './animations/sprite_animation.js';
import { Textures } from './textures.js';

export class Game {
    constructor(app) {
      this.players = [];
      
      this.app = app;
      
      this.container = new PIXI.Container();
      document.body.appendChild(this.app.canvas);
      this.app.stage.addChild(this.container);
  
      this.container.x = 0;
      this.container.y = 0;
      this.container.pivot.x = this.container.width / 2;
      this.container.pivot.y = this.container.height / 2;
  
      this.zoomLevel = 1.5;
      this.container.scale.set(this.zoomLevel);

      this.localPlayer = null;
    }
  
    static async init() {
      await Textures.loadAll();
  
      return new Game(Textures.getApp());
    }

    loadPlayer(id, skinNum, x, y, active, ws){
      const localPlayerSprite = new SpriteAnimation(skinNum);

      const player = new Player(id, localPlayerSprite, x, y, active, ws);
        
      this.container.addChild(player.sprite);
      
      if(active){
        this.localPlayer = player;
      }

      this.players.push(player);
      return player;
    }

    startLoop() {
      this.app.ticker.add(() => {
        if(this.localPlayer){
          this.localPlayer.updatePosition();
          this.container.x = this.app.screen.width / 2 - this.localPlayer.getPosX() * this.zoomLevel;
          this.container.y = this.app.screen.height / 2 - this.localPlayer.getPosY() * this.zoomLevel;
          
          this.localPlayer.position.x = Math.max(0, Math.min(this.app.screen.width - this.localPlayer.playerWidth, this.localPlayer.position.x));
          this.localPlayer.position.y = Math.max(0, Math.min(this.app.screen.height - this.localPlayer.playerHeight, this.localPlayer.position.y));
        }
        
      });
    }

    getPlayers(){
      return this.players;
    }
    updatePlayers(players){
      this.players = players;
      this.players.forEach(player => {
        player.setPosition(player.getPosX(), player.getPosY());
      });
    }
    refreshState(data){
      this.updatePlayers(data.players);
    }
  }