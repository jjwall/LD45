/**
 * Control component.
 */
export interface ControlComponent {
    x: number,
    y: number,
    jump: boolean;
    attack: boolean;
    attackTimer: number;
    attacked: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
}
