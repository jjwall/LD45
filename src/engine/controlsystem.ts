import { Entity } from "./entity";
import { changeSequence } from "./helpers";
import { HurtBoxTypes, SequenceTypes } from "./enums";
import { Vector3 } from "three";

/**
 * Control system.
 * @param ents Ents from the controllableEntities registry.
 */
export function controlSystem(ents: ReadonlyArray<Entity>){
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
        }
    });
}