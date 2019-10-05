import {
    MeshBasicMaterial,
    NearestFilter,
} from "three";
import { Entity } from "./entity";
import { Resources } from "../resourcemanager";
import { BaseState } from "../basestate";

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
            // const followedEntY = ent.followsEntity.entityToFollow.pos.loc.y;
            // const followedEntX = ent.followsEntity.entityToFollow.pos.loc.x;
            // const followingEntY = ent.pos.loc.y;
            // const followingEntX = ent.pos.loc.x;
            const angle = Math.atan2(ent.followsEntity.entityToFollow.pos.loc.y - ent.pos.loc.y, ent.followsEntity.entityToFollow.pos.loc.x - ent.pos.loc.x);
            // const v1 = followingEntX - followedEntX;
            // const v2 = followingEntY - followedEntY;
            // const distance = Math.sqrt(v1*v1 + v2*v2);
                // if (this.vel < this.maxVel) {
                    // this.vel += this.accl;
                // }if (distance > 10) {
            ent.pos.loc.x += Math.cos(angle) * ent.vel.acceleration;
            ent.pos.loc.y += Math.sin(angle) * ent.vel.acceleration;
        }
    })
}

export function movementSystem(ents: ReadonlyArray<Entity>) {
    ents.forEach(ent => {
        if (ent.control && ent.pos) {
            const v1 = ent.pos.loc.x - ent.control.x;
            const v2 = ent.pos.loc.y - ent.control.y;
            const distance = Math.sqrt(v1*v1 + v2*v2);

            if (distance > 10) {
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

export function spawnerSystem(ents: ReadonlyArray<Entity>, state: BaseState) {
    ents.forEach(ent => {
        if (ent.spawner) {
            // update random number somewhere...
            const randomNum = Math.floor(Math.random() * (ent.spawner.randomNumber - 0 + 1)) + 0;

            if (randomNum === 15 || randomNum === 67) {
                state.registerEntity(ent.spawner.spawnEntity());
            }
        }
    });
}