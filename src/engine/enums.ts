/**
 * Enum for all possible types of HurtBoxes. Naming is arbitrary
 * as long as they are properly set in HitBox "collidesWith" property
 * and HurtBox "type" property.
 */
export const enum HurtBoxTypes {
    worker,
    marine,
    barracks,
    alien,
    // ..
}

/**
 * List of all possible animation sequences.
 */
export const enum SequenceTypes {
    idle,
    walk,
    run,
    attack
}