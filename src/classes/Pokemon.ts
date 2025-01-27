import { IPokemon } from "../index.js";

export class Pokemon implements IPokemon{
    name: string;
    hp: number;
    ap: number;
    type: string;
    dp: number;
    abilities:string[];
    level: number;
    sprites: string;

    constructor(n:string, hp:number, ap:number, type:string, dp:number, abilities:string[], level:number, sprites:string){
        this.name = n;
        this.hp = hp;
        this.ap = ap;
        this.type = type;
        this.dp = dp;
        this.abilities = abilities;
        this.level = level;
        this.sprites = sprites;
    }


}