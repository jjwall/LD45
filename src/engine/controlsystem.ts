import { Entity } from "./entity";
import { changeSequence } from "./helpers";
import { HurtBoxTypes, SequenceTypes } from "./enums";
import { Vector3 } from "three";
import { GameState } from "./gamestate";
import { initializePosition } from "./initializers";
import { initializeSprite } from "./initializers";

/**
 * Control system.
 * @param ents Ents from the controllableEntities registry.
 */
export function controlSystem(ents: ReadonlyArray<Entity>, state: GameState){
    ents.forEach(ent => {
        if (ent.control && ent.pos) {
            const v1 = ent.pos.loc.x - ent.control.x;
            const v2 = ent.pos.loc.y - ent.control.y;
            const distance = Math.sqrt(v1*v1 + v2*v2);

            if (distance > 5) {
                const angle = Math.atan2(ent.control.y - ent.pos.loc.y, ent.control.x - ent.pos.loc.x);
                ent.pos.loc.x += Math.cos(angle) * 2;
                ent.pos.loc.y += Math.sin(angle) * 2;

                ent.control.moving = true;
            }
            else {
                ent.control.moving = false;
            }

            if (ent.control.selected) {
                if (ent.control.selector == undefined) {
                    ent.control.selector = new Entity();
                    ent.control.selector.pos = initializePosition(ent.pos.loc.x + 5, ent.pos.loc.y - 20, 4);
                    ent.control.selector.sprite = initializeSprite("./data/textures/selector.png", state.gameScene, 4);
                    state.registerEntity(ent.control.selector);
                }
                else {
                    ent.control.selector.pos.loc.x = ent.pos.loc.x + 5;
                    ent.control.selector.pos.loc.y = ent.pos.loc.y - 20;
                }
            }
        }
    });
}