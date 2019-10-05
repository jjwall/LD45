import { Entity } from "./entity";

/**
 * Control component.
 */
export interface ControlComponent {
    x: number,
    y: number,
    moving: boolean;
    selected: boolean;
    selector: Entity;
    // ignore below
    jump: boolean;
    attack: boolean;
    attackTimer: number;
    attacked: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
}
