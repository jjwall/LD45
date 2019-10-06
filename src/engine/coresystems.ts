import {
    MeshBasicMaterial,
    NearestFilter,
} from "three";
import { Entity } from "./entity";
import { Resources } from "../resourcemanager";
import { BaseState } from "../basestate";
import { changeSequence } from "./helpers";
import { SequenceTypes } from "./enums";
import { initializeTimer } from "./initializers";
import { GameState } from "./gamestate";

/**
 * Rudimentary velocity implementation... will replace directions with
 * angle and magnitude later on
 */
export function velocitySystem(ents: ReadonlyArray<Entity>) : void {
    ents.forEach(ent => { 
        if (ent.vel && ent.pos) {
            if (ent.vel.friction) {
                ent.vel.positional.multiplyScalar(ent.vel.friction);
            }
            ent.pos.loc.add(ent.vel.positional);
            ent.pos.dir.applyEuler(ent.vel.rotational);
        }
    });
}

/**
 * Animation System.
 * @param ents Lists of ents to run system with. Must have anim and sprite components.
 */
export function animationSystem(ents: ReadonlyArray<Entity>) : void {
    ents.forEach(ent => {
        if (ent.anim && ent.sprite) {
            ent.anim.ticks--;
            if (ent.anim.ticks <= 0) {
                ent.anim.frame = ent.anim.blob[ent.anim.sequence][ent.anim.frame].nextFrame;
                ent.anim.ticks = ent.anim.blob[ent.anim.sequence][ent.anim.frame].ticks;

                const newSpriteMap = Resources.instance.getTexture(ent.anim.blob[ent.anim.sequence][ent.anim.frame].texture);
                newSpriteMap.magFilter = NearestFilter;
                ent.sprite.material = new MeshBasicMaterial({ map: newSpriteMap, transparent: true });
            }
        }
    });
}

/**
 * Collision system.
 * @param ents List of ents to run system with. Hitting ents must have hitBox and pos components.
 * Hurting ents must have hurtBox and pos components.
 */
export function collisionSystem(ents: ReadonlyArray<Entity>) {
    ents.forEach(hittingEnt => {
        if (hittingEnt.hitBox && hittingEnt.pos) {
            ents.forEach(hurtingEnt => {
                if (hurtingEnt.hurtBox && hurtingEnt.pos) {
                    if (hittingEnt.hitBox.collidesWith.indexOf(hurtingEnt.hurtBox.type) > -1) {
                        if (hittingEnt.pos.loc.x + hittingEnt.hitBox.offsetX - hittingEnt.hitBox.width/2 < hurtingEnt.pos.loc.x + hurtingEnt.hurtBox.offsetX + hurtingEnt.hurtBox.width/2 &&
                            hittingEnt.pos.loc.x + hittingEnt.hitBox.offsetX + hittingEnt.hitBox.width/2 > hurtingEnt.pos.loc.x + hurtingEnt.hurtBox.offsetX - hurtingEnt.hurtBox.width/2 &&
                            hittingEnt.pos.loc.y + hittingEnt.hitBox.offsetY - hittingEnt.hitBox.height/2 < hurtingEnt.pos.loc.y + hurtingEnt.hurtBox.offsetY + hurtingEnt.hurtBox.height/2 &&
                            hittingEnt.pos.loc.y + hittingEnt.hitBox.offsetY + hittingEnt.hitBox.height/2 > hurtingEnt.pos.loc.y + hurtingEnt.hurtBox.offsetY - hurtingEnt.hurtBox.height/2) {
                            if (hittingEnt.hitBox.onHit) {
                                hittingEnt.hitBox.onHit(hittingEnt, hurtingEnt);
                            }

                            if (hurtingEnt.hurtBox.onHurt) {
                                hurtingEnt.hurtBox.onHurt(hurtingEnt, hittingEnt);
                            }
                        }
                    }
                }
            });
        }
    });
}

/**
 * Position system.
 * @param ents
 */
export function positionSystem(ents: ReadonlyArray<Entity>) {
    ents.forEach(ent => {
        if (ent.sprite && ent.pos) {
            ent.sprite.position.copy(ent.pos.loc);
            ent.sprite.rotation.set(0, 0, Math.atan2(ent.pos.dir.y, ent.pos.dir.x));

            if (ent.pos.loc.y > 720) {
                ent.pos.loc.y = 0;
                ent.sprite.position.copy(ent.pos.loc);
            }

            if (ent.pos.loc.x > 1280) {
                ent.pos.loc.x = 0;
                ent.sprite.position.copy(ent.pos.loc);
            }

            if (ent.pos.loc.y < 0) {
                ent.pos.loc.y = 720;
                ent.sprite.position.copy(ent.pos.loc);
            }

            if (ent.pos.loc.x < 0) {
                ent.pos.loc.x = 1280;
                ent.sprite.position.copy(ent.pos.loc);
            }
        }
    });
}

/**
 * Timer system.
 * @param ents 
 */
export function timerSystem(ents: ReadonlyArray<Entity>) {
    ents.forEach(ent => {
        if (ent.timer) {
            ent.timer.ticks--;

            if (ent.timer.ticks <= 0) {
                // Trigger ontimeout callback function.
                ent.timer.ontimeout();

                // Remove timer component from the entity.
                ent.timer = undefined;
            }
        }
    });
}

export function followSystem(ents: ReadonlyArray<Entity>) {
    ents.forEach(ent => {
        if (ent.followsEntity) {
            const speed = 1.75;
            const angle = Math.atan2(ent.followsEntity.entityToFollow.pos.loc.y - ent.pos.loc.y, ent.followsEntity.entityToFollow.pos.loc.x - ent.pos.loc.x);

            ent.pos.loc.x += Math.cos(angle) * speed;
            ent.pos.loc.y += Math.sin(angle) * speed;
        }
    })
}

export function spawnerSystem(ents: ReadonlyArray<Entity>, state: BaseState) {
    ents.forEach(ent => {
        if (ent.spawner) {
            if (!ent.timer && ent.spawner.randomNumber === 0) {
                ent.timer = initializeTimer(ent.spawner.spawnTime, () => {
                    state.registerEntity(ent.spawner.spawnEntity());
                    ent.timer = undefined
                });
            }

            if (ent.spawner.randomNumber > 0) {
                // update random number somewhere...
                const randomNum = Math.floor(Math.random() * (ent.spawner.randomNumber - 0 + 1)) + 0;

                if (randomNum === 15 || randomNum === 67) {
                    state.registerEntity(ent.spawner.spawnEntity());
                }
            }
        }
    });
}

export function animControlSystem(ents: ReadonlyArray<Entity>, state: BaseState) {
    ents.forEach(ent => {
        if (ent.control && ent.anim) {
            if (ent.control.moving && !ent.control.movingAnimSet) {
                ent.anim = changeSequence(SequenceTypes.walk, ent.anim);
                ent.control.movingAnimSet = true;
            }
            else if (!ent.control.moving && !ent.control.attack) {
                ent.anim = changeSequence(SequenceTypes.idle, ent.anim);
                ent.control.movingAnimSet = false;
            }

            if (ent.control.attack && !ent.control.attackingAnimSet) {
                ent.anim = changeSequence(SequenceTypes.attack, ent.anim);
                ent.control.attackingAnimSet = true;
            }
            else if (!ent.control.attack && !ent.control.moving) {
                ent.anim = changeSequence(SequenceTypes.idle, ent.anim);
                ent.control.attackingAnimSet = false;
            }
        }
    })
}

export function marineAttackSystem(ents: ReadonlyArray<Entity>, state: GameState) {
    ents.forEach(ent => {
        if (ent.marine) {
            state.aliens.forEach(alien => {
                const v1 = ent.pos.loc.x - alien.pos.loc.x;
                const v2 = ent.pos.loc.y - alien.pos.loc.y;
                const distance = Math.sqrt(v1*v1 + v2*v2);

                if (distance < 150) {
                    console.log("shoot!!!");
                    ent.control.attack = true;
                    // ent.control.x = ent.pos.loc.x;
                    // ent.control.y = ent.pos.loc.y;
                }
                else {
                    ent.control.attack = false;
                }

            });
        }
    });
}