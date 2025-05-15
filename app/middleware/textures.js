import { ChestAnimation } from "./animations/chest_animation.js";
import { SpriteAnimation } from "./animations/sprite_animation.js";
import { Gun } from "./items/gun.js";
import { Structure } from "./environment/structure.js";

var chestRanks = ['wooden', 'silver', 'gold', 'diamond']
var playerSkins = ['1', '2', '3'];
var orientations = ['front', 'behind', 'left', 'right'];
var guns = ['AK47', 'M15', 'M24', 'Pistol', 'Shotgun'];

export class Textures{

    static async loadAll(){
        await this.loadChests();
        await this.loadPlayerSkins();
        await this.loadGuns();
        await this.loadEnvironment();
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

    static async loadGuns(){
        let gunPaths = [];
        Object.keys(guns).forEach(gun => {
            gunPaths.push(Gun.getPath(guns[gun]));
        });

        await PIXI.Assets.load(
            gunPaths
        );
    }

    static async loadEnvironment(){
        const envPaths = [
            Structure.getPath('tree', 1),
            Structure.getPath('tree', 2),
            Structure.getPath('tree', 3),
            Structure.getPath('grass', 1),
            Structure.getPath('grass', 2),
            Structure.getPath('grass', 3),
            Structure.getPath('grass', 4),
            Structure.getPath('bush', 1),
            Structure.getPath('bush', 2),
            Structure.getPath('bush', 3),
            Structure.getPath('bush', 4),
            Structure.getPath('bush', 5),
            Structure.getPath('bush', 6),


        ];

        await PIXI.Assets.load(
            envPaths
        );
    }
}