import {Player} from './player.js';
import {SpriteAnimation} from './animations/sprite_animation.js';
import {ChestAnimation} from './animations/chest_animation.js';
import { Textures } from './textures.js';
import { Grass, Bush, Tree } from './environment/plant.js';
import { Structure } from './environment/structure.js';
import { bullets } from './items/gun.js';
import { Hitbox } from './hitbox.js';
import { gunRegistry } from './registry.js';

export class Game {
    constructor(isServer, app) {
      this.players = [];
      this.structures = [];
      this.chests = [];
      this.items = [];
      this.isServer = isServer;

      if (!isServer) {
        this.app = app;
        //console.log(this.app.canvas.width);
        //console.log(this.app.canvas.height);
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

        const crosshair = "url('/public/assets/weapons/crosshair.png'),auto";

        this.app.renderer.events.cursorStyles.default = crosshair
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
        let tree = new Tree(structId, Math.random() * 1870 + 15, Math.random() * 770 + 15, null);
        game.structures.push(tree);
        structId++;
      }

      for(let i = 0; i<500; ++i){
        game.structures.push(new Grass(0, Math.random() * 1870 + 15, Math.random() * 770 + 15, null));
      }

      for(let i = 0; i<75; ++i){
        let bush = new Bush(structId, Math.random() * 1870 + 15, Math.random() * 770 + 15, null);
        game.structures.push(bush);
        structId++;
      }
      let chestId = 0;
      for(let i = 0; i<50; ++i){
        const chest = ChestAnimation.random(chestId, 1900, 800);
        game.chests.push(chest);
        // console.log(chest);
        chestId++;
      }

      return game;
    }

    loadPlayer(username, id, skinNum, x, y, active, ws, orientation, health){
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
      player.health = health;


      //console.log("[loadPlayer] Adding player:", player);
      //if (!player) {
        //  console.warn("Attempting to add undefined player!", { username, id, skinNum, x, y, active, orientation, health });
      //}
      this.players.push(player);
      // player.hitbox.makeVisible(this.container);

      player.inventoryContainer = new PIXI.Container();
      player.inventoryContainer.zIndex = 100;
      this.app.stage.addChild(player.inventoryContainer);

      return player;
    }

    removePlayer(id){
      //console.log("removing " + id);


      for(let i = 0; i<this.players.length; ++i){
        if(this.players[i].id == id){
          const p = this.players[i];
          p.destroy();

          this.players.splice(i, 1);
        }
      }
      //console.log("Players in game:")
      //for (let i = 0; i < this.players.length; i++){
        //console.log("   " + this.players[i].id)
      //}
    }
    kill(id){
      const player = this.players.find((player) => player.id == id);
      //console.log("player dying:" + player.id)
      if(player.alive){
        player.alive = false;
        //console.log('kill');
        for (let i = player.inventory.length() - 1; i >= 0; --i) {

          let itemData = player.inventory.inventory[i].toJSON();
          player.inventory.dropItem(i);
          itemData.isHeld = false;
          itemData.sprite.visible = true;

          //console.log('Before refresh:', this.items[itemData.id]);
          this.items[itemData.id].refresh(itemData);
          //console.log('After refresh:', this.items[itemData.id]);
        }
        if(this.localPlayer && this.localPlayer.id == id){
          window.location.href = '/home';
        } else{
          window.location.href = '/victory';
        }
      }
      this.removePlayer(player.id);

    }

    findPlayer(id){
      return this.players.find(p => p.id == id);
    }

    startLoop() {
      this.app.ticker.add((delta) => {
        if(this.localPlayer && this.localPlayer.alive){
          this.updateBullets(delta);

          this.container.x = this.app.screen.width / 2 - this.localPlayer.getPosX() * this.zoomLevel;
          this.container.y = this.app.screen.height / 2 - this.localPlayer.getPosY() * this.zoomLevel;

          this.localPlayer.position.x = Math.max(0, Math.min(this.app.screen.width - this.localPlayer.playerWidth, this.localPlayer.position.x));
          this.localPlayer.position.y = Math.max(0, Math.min(this.app.screen.height - this.localPlayer.playerHeight, this.localPlayer.position.y));

          const mouseScreen = new PIXI.Point(this.localPlayer.controller.mouseX + 8, this.localPlayer.controller.mouseY + 8);
          const mouseWorld = this.container.toLocal(mouseScreen);

          this.localPlayer.mouseX = mouseWorld.x;
          this.localPlayer.mouseY = mouseWorld.y;

          this.localPlayer.update(this.structures, this.chests, this.items, delta);

          this.sendState();
          this.sendItems(this.localPlayer.inventory.inventory);

          // console.log(this.items);
        }
      });
    }

    sendItems(items){
      if(this.localPlayer.alive){
        this.localPlayer.ws.send(JSON.stringify({
          type: 'itemState',
          itemState: items.map(i => i.toJSON()),
        }));
      }

    }

    updateBullets(delta){
      bullets.forEach((bullet, index) => {
          if (bullet.alive) {
              bullet.update(delta);
          } else {
              bullets.splice(index, 1);
          }
          const player = Hitbox.collision(bullet, this.players);
          if(bullet.shotBy != null && !bullet.shouldKill){
            if(player){
              this.damage(player.id, bullet.gun.damage);
              bullet.shouldKill = true;
            }
          }
          const struct = Hitbox.collision(bullet, this.structures);
          if(struct){
              bullet.shouldKill = true;
          }
      });
    }

    damage(id, damage){
      this.players.find((player) => player.id == id).health -= damage;
      this.localPlayer.ws.send(JSON.stringify({
        type: 'health',
        id: id,
        health: this.players.find((player) => player.id == id).health,
      }));
    }

    getPlayers(){
      return this.players;
    }

    loadState(state){
      state.structures.forEach((structure) => {
        let struct;
        if(structure.type === 'tree'){
          struct = new Tree(structure.id, structure.x, structure.y, this.container, structure.variant);;
          //struct.hitbox.makeVisible(this.container);
        }
        if(structure.type === 'grass'){
          struct = new Grass(structure.id, structure.x, structure.y, this.container, structure.variant);;

        }
        if(structure.type === 'bush'){
          struct = new Bush(structure.id, structure.x, structure.y, this.container, structure.variant);;
          //struct.hitbox.makeVisible(this.container);
        }
        // console.log(struct.hitbox);
        // struct.hitbox.makeVisible(this.container);

        this.structures.push(struct);
      });

      state.chests.forEach((chest) => {
        //console.log(chest.id);
        let c = new ChestAnimation(chest.id, chest.rank, chest.x, chest.y);
        if(chest.opened){
          c.openChest(true);
        }
        // console.log(chest);
        this.chests.push(c);

        this.container.addChild(c.sprite);

        // c.loadItems(this.container, this.items);
      });
      // this.chests[1].openChest(false);

      state.items.forEach((item) => {
        item.id = this.items.length;
        const i = this.addItem(item);
      });
    }

    refreshChest(id, item){
      // console.log(this.chests);
      // this.chests[id].items = item;
      this.chests[id].openChest(true);
    }

    addItem(item){
      if(item.id == null){
        item.id = this.items.length;
      }
      //console.log(item.rarity);
      const i = new gunRegistry[item.gunName](item.id, item.x, item.y, 20, item.rarity, 25);
      // i.rarity = item.rarity;
      i.sprite.visible = true;
      this.items.push(i);
      this.container.addChild(i.sprite);
      return i;
    }

    sendState(){
      if (!this.localPlayer.alive) return;
      this.localPlayer.ws.send(JSON.stringify({
        type: 'gameState',
        gameState: this.stateJSON(),
      }));
    }

    stateJSON(){
      return {
        structures: this.structures.map(structure => structure.toJSON()),
        chests: this.chests,
        items: this.items,
      }
    }
  }
