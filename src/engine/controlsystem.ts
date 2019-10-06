import { Entity } from "./entity";
import { changeSequence } from "./helpers";
import { HurtBoxTypes, SequenceTypes } from "./enums";
import { Vector3, NearestFilter, MeshBasicMaterial } from "three";
import { GameState } from "./gamestate";
import { initializePosition, initializeTimer, initializeControls, initializeAnimation } from "./initializers";
import { initializeSprite } from "./initializers";
import { Resources } from "../resourcemanager";
import { marineAnim } from "../../data/animations/marine";

/**
 * Control system.
 * @param ents Ents from the controllableEntities registry.
 */
export function controlSystem(ents: ReadonlyArray<Entity>, state: GameState){
    ents.forEach(ent => {
        if (ent.control && ent.pos) {
            // movement
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

            // selection
            if (ent.control.selected) {
                if (ent.control.selector == undefined) {
                    ent.control.selector = new Entity();
                    ent.control.selector.pos = initializePosition(ent.pos.loc.x + 3, ent.pos.loc.y - 20, 4);
                    ent.control.selector.sprite = initializeSprite("./data/textures/selector.png", state.gameScene, 4);
                    state.registerEntity(ent.control.selector);
                }
                else {
                    ent.control.selector.pos.loc.x = ent.pos.loc.x + 4;
                    ent.control.selector.pos.loc.y = ent.pos.loc.y - 20;
                }

                // worker hotkeys
                if (ent.worker) {
                    // B - Barracks
                    if (ent.control.bKey && !ent.timer) {
                        let barracks = new Entity();
                        barracks.pos = initializePosition(ent.pos.loc.x, ent.pos.loc.y, 3);
                        barracks.sprite = initializeSprite("./data/textures/barracks_wireframe.png", state.gameScene, 4);
                        state.registerEntity(barracks);

                        ent.timer = initializeTimer(300, () => {
                            const newSpriteMap = Resources.instance.getTexture("./data/textures/barracks.png");
                            newSpriteMap.magFilter = NearestFilter;
                            barracks.sprite.material = new MeshBasicMaterial({ map: newSpriteMap, transparent: true });
                            barracks.spawner = { spawnTime: 500, randomNumber: 0, spawnEntity: (): Entity => {
                                let marine = new Entity();
                                marine.pos = initializePosition(barracks.pos.loc.x - 5, barracks.pos.loc.y - 30, 5);
                                marine.sprite = initializeSprite("./data/textures/marine.png", state.gameScene, 4);
                                marine.control = initializeControls(marine.pos.loc.x, marine.pos.loc.y);
                                marine.anim = initializeAnimation(SequenceTypes.idle, marineAnim);
                                marine.marine = {};

                                return marine;
                            }}

                            ent.timer = undefined;
                        });
                    }
                }
            }
            else {
                if (ent.control.selector) {
                    state.gameScene.remove(ent.control.selector.sprite);
                    state.removeEntity(ent.control.selector);
                    ent.control.selector = undefined;
                }
            }
        }
    });
}