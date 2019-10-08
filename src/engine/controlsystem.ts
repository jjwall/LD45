import { Entity } from "./entity";
import { changeSequence, playAudio } from "./helpers";
import { HurtBoxTypes, SequenceTypes } from "./enums";
import { Vector3, NearestFilter, MeshBasicMaterial } from "three";
import { GameState } from "./gamestate";
import { initializePosition, initializeTimer, initializeControls, initializeAnimation, initializeHurtBox } from "./initializers";
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
                ent.pos.loc.x += Math.cos(angle) * 2.25;
                ent.pos.loc.y += Math.sin(angle) * 2.25;

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
                    if (ent.worker)
                        state.rootComponent.toggleWorkerUiOn();
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
                        playAudio("./data/audio/place_barracks.wav", 0.3);

                        ent.timer = initializeTimer(300, () => {
                            const newSpriteMap = Resources.instance.getTexture("./data/textures/barracks.png");
                            newSpriteMap.magFilter = NearestFilter;
                            barracks.sprite.material = new MeshBasicMaterial({ map: newSpriteMap, transparent: true });
                            barracks.hurtBox = initializeHurtBox(barracks.sprite, HurtBoxTypes.barracks);
                            barracks.hit = { points: 300 };
                            state.rootComponent.addScoreFromBarracks();
                            playAudio("./data/audio/barracks_finish.wav", 0.3);
                            barracks.hurtBox.onHurt = () => {
                                barracks.hit.points--;
                                if (barracks.hit.points <= 0) {
                                    let index = state.alienTargets.indexOf(barracks);
                                    if (index > -1) {
                                        state.alienTargets.splice(index, 1);
                                    }
                                }
                            }
                            state.alienTargets.push(barracks);
                            barracks.spawner = { spawnTime: 500, randomNumber: 0, spawnEntity: (): Entity => {
                                let marine = new Entity();
                                marine.pos = initializePosition(barracks.pos.loc.x - 5, barracks.pos.loc.y - 30, 5);
                                marine.sprite = initializeSprite("./data/textures/marine.png", state.gameScene, 4);
                                marine.control = initializeControls(marine.pos.loc.x, marine.pos.loc.y);
                                marine.anim = initializeAnimation(SequenceTypes.idle, marineAnim);
                                marine.marine = {};
                                marine.hurtBox = initializeHurtBox(marine.sprite, HurtBoxTypes.marine);
                                marine.hit = { points: 100 };
                                marine.hurtBox.onHurt = () => {
                                    marine.hit.points--;
                                    if (marine.hit.points <= 0) {
                                        if (marine.marine.target) {
                                            if (marine.marine.target.targeted) {
                                                state.gameScene.remove(marine.marine.target.targeted.sprite);
                                                state.removeEntity(marine.marine.target.targeted);
                                                marine.marine.target.targeted = undefined;
                                            }
                                        }
                                        if (marine.control.selected) {
                                            state.gameScene.remove(marine.control.selector.sprite);
                                            state.removeEntity(marine.control.selector);
                                        }
                                        let index = state.alienTargets.indexOf(marine);
                                        if (index > -1) {
                                            state.alienTargets.splice(index, 1);
                                        }
                                    }
                                }
                                state.alienTargets.push(marine);

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

                    if (ent.worker)
                        state.rootComponent.toggleWorkerUiOff();
                }
            }
        }
    });
}