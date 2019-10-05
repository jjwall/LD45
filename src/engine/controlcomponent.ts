/**
 * Control component.
 */
export interface ControlComponent {
    x: number,
    y: number,
    moving: boolean;
    jump: boolean;
    attack: boolean;
    attackTimer: number;
    attacked: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
}
