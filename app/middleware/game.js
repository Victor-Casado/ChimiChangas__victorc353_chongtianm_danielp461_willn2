import {Player} from './player.js';
import {SpriteAnimation} from './animations/sprite_animation.js';
import { Textures } from './textures.js';

export class Game {
    constructor(isServer, app) {
      this.players = [];
      this.structures = [];
      this.chests = [];
      this.isServer = isServer;

      if (!isServer) {
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
    }

    static async clientInit() {
      const app = new PIXI.Application();
      await app.init({ background: '#1099bb', resizeTo: window });

      await Textures.loadAll();

      return new Game(false, app);
    }

    static async serverInit(){
      return new Game(true, null);
    }

    loadPlayer(username, id, skinNum, x, y, active, ws, orientation){
      const localPlayerSprite = new SpriteAnimation(skinNum);

      const player = new Player(username, id, localPlayerSprite, x, y, active, ws, orientation);


      this.container.addChild(player.sprite);


      const texts = player.getTexts();

      Object.keys(texts).forEach(text => {
        this.container.addChild(texts[text]);
      });

      if(active){
        this.localPlayer = player;
      }

      this.players.push(player);
      return player;
    }

    removePlayer(id){
      console.log("removing " + id);
      for(let i = 0; i<this.players.length; ++i){
        if(this.players[i].id == id){
          const p = this.players[i];
          p.destroy();

          this.players.pop(i);
        }
      }

    }

    findPlayer(id){
      return this.players.find(p => p.id == id);
    }

    startLoop() {
      this.app.ticker.add(() => {
        this.players.forEach((player) => {
          player.updatePosition([]);
        });
        this.localPlayer.update(this.structures, this.chests, this.localPlayer.inventory);
        // this.localPlayer.update(this.structures, this.chests, this.localPlayer.inventory);
        if(this.localPlayer){
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
  }
