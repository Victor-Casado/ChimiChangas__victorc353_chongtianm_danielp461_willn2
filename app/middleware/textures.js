import { ChestAnimation } from "./animations/chest_animation.js";
import { SpriteAnimation } from "./animations/sprite_animation.js";

var chestRanks = ['wooden', 'silver', 'gold', 'diamond']
var playerSkins = ['1', '2', '3'];
var orientations = ['front', 'behind', 'left', 'right'];

export class Textures{

    static async loadAll(){
        await this.loadChests();
        await this.loadPlayerSkins();
    }

    static async loadChests(){
        let chestPaths = [];
        Object.keys(chestRanks).forEach(rank => {
            chestPaths.push(ChestAnimation.getPath(chestRanks[rank]));
        });

        await PIXI.Assets.load(
            chestPaths
        );
    }

    static async loadPlayerSkins(){
        let skinPaths = [];
        Object.keys(playerSkins).forEach(skin => {
            Object.keys(orientations).forEach(orientation => {
                skinPaths.push(SpriteAnimation.getPath(playerSkins[skin], orientations[orientation]));
            });
        })

        await PIXI.Assets.load(
            skinPaths
        );
    }

    static async loadTexts(){
        await PIXI.Assets.load(
            'https://pixijs.com/assets/bitmap-font/desyrel.xml'
        );
    }

    static getApp(){
        return app;
    }
}