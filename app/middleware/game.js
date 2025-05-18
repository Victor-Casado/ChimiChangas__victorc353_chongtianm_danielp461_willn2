import {Player} from './player.js';
import {SpriteAnimation} from './animations/sprite_animation.js';
import { Textures } from './textures.js';
import { Grass, Bush, Tree } from './environment/plant.js';
import { Structure } from './environment/structure.js';

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

        this.zoomLevel = 1.2;
        this.container.scale.set(this.zoomLevel);

        this.localPlayer = null;
      }
    }

    static async clientInit() {
      const app = new PIXI.Application();
      await app.init({ background: '#78852b', resizeTo: window });

      await Textures.loadAll();

      return new Game(false, app);
    }

    static async serverInit(){
      
      let game = new Game(true, null);

      for(let i = 0; i<8; ++i){
        let tree = new Tree(0, Math.random() * 800, Math.random() * 800, null);
        game.structures.push(tree);
      }

      for(let i = 0; i<50; ++i){
        game.structures.push(new Grass(0, Math.random() * 800, Math.random() * 800, null));
      }

      for(let i = 0; i<15; ++i){
        let bush = new Bush(0, Math.random() * 800, Math.random() * 800, null);
        game.structures.push(bush);
      }

      return game;
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
      this.app.ticker.add((delta) => {
        // this.players.forEach((player) => {
        //   player.updatePosition(this.structures, delta);
        // });
        this.localPlayer.update(this.structures, this.chests, this.localPlayer.inventory, delta);
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

    loadState(state){
      state.structures.forEach((structure) => {
        let struct;
        if(structure.type === 'tree'){
          struct = new Tree(structure.id, structure.x, structure.y, this.container, structure.variant);;
        }
        if(structure.type === 'grass'){
          struct = new Grass(structure.id, structure.x, structure.y, this.container, structure.variant);;
        }
        if(structure.type === 'bush'){
          struct = new Bush(structure.id, structure.x, structure.y, this.container, structure.variant);;
        } 
        console.log(struct.hitbox);
        // struct.hitbox.makeVisible(this.container);
        this.structures.push(struct);
      });
    }

    stateJSON(){
      return {
        structures: this.structures.map(structure => structure.toJSON()),
        chests: this.chests.map(chest => chest.toJSON())
      }
    }
  }
