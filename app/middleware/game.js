import {Player} from './player.js';
import {SpriteAnimation} from './animations/sprite_animation.js';
import {ChestAnimation} from './animations/chest_animation.js';
import { Textures } from './textures.js';
import { Grass, Bush, Tree } from './environment/plant.js';
import { Structure } from './environment/structure.js';
import { bullets } from './items/gun.js';
import { Hitbox } from './hitbox.js';

export class Game {
    constructor(isServer, app) {
      this.players = [];
      this.structures = [];
      this.chests = [];
      this.items = [];
      this.isServer = isServer;

      if (!isServer) {
        this.app = app;
        console.log(this.app.canvas.width);
        console.log(this.app.canvas.height);
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

      let structId = 0;

      for(let i = 0; i<40; ++i){
        let tree = new Tree(structId, Math.random() * 1885 + 15, Math.random() * 785 + 15, null);
        game.structures.push(tree);
        structId++;
      }

      for(let i = 0; i<500; ++i){
        game.structures.push(new Grass(0, Math.random() * 1885 + 15, Math.random() * 785 + 15, null));
      }

      for(let i = 0; i<150; ++i){
        let bush = new Bush(structId, Math.random() * 1885 + 15, Math.random() * 785 + 15, null);
        game.structures.push(bush);
        structId++;
      }

      for(let i = 0; i<5; ++i){
        const chest = ChestAnimation.random(structId, 800, 800);
        game.chests.push(chest);
        // console.log(chest);
        structId++;
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
        
        this.updateBullets(delta);

        if(this.localPlayer){
          this.container.x = this.app.screen.width / 2 - this.localPlayer.getPosX() * this.zoomLevel;
          this.container.y = this.app.screen.height / 2 - this.localPlayer.getPosY() * this.zoomLevel;

          this.localPlayer.position.x = Math.max(0, Math.min(this.app.screen.width - this.localPlayer.playerWidth, this.localPlayer.position.x));
          this.localPlayer.position.y = Math.max(0, Math.min(this.app.screen.height - this.localPlayer.playerHeight, this.localPlayer.position.y));
          
          const mouseScreen = new PIXI.Point(this.localPlayer.controller.mouseX, this.localPlayer.controller.mouseY);
          const mouseWorld = this.container.toLocal(mouseScreen);

          this.localPlayer.mouseX = mouseWorld.x;
          this.localPlayer.mouseY = mouseWorld.y;

          this.localPlayer.update(this.structures, this.chests, this.items, delta);
        }
      });
    }
    updateBullets(delta){
      bullets.forEach((bullet, index) => {
          if (bullet.alive) {
              bullet.update(delta);
          } else {
              bullets.splice(index, 1); 
          }
          if(Hitbox.collision(bullet, this.structures)){
              console.log("bang");
              bullet.shouldKill = true;
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
        // console.log(struct.hitbox);
        // struct.hitbox.makeVisible(this.container);
        
        this.structures.push(struct);
      });

      state.chests.forEach((chest) => {
        console.log(chest.id);
        let c = new ChestAnimation(chest.id, chest.rank, chest.x, chest.y);
        // c.items = chest.items;
        console.log(chest);
        this.chests.push(c);

        this.container.addChild(c.sprite);

        c.loadItems(this.container, this.items);
      });
      this.chests[1].openChest();
    }

    refreshState(type, chest, id){
      if(type == 'chest'){
        // const items = chest.items;
        this.chests[id].openChest();
      }
    }

    stateJSON(){
      return {
        structures: this.structures.map(structure => structure.toJSON()),
        chests: this.chests,
      }
    }
  }
