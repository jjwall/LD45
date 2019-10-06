import { AnimationSchema } from "../../src/engine/engineinterfaces";
import { SequenceTypes } from "../../src/engine/enums";

export const workerAnim: AnimationSchema = {
    [SequenceTypes.idle]: [
        {
            ticks: 0,
            texture: "./data/textures/worker.png",
            nextFrame: 0
       },
    ],
    [SequenceTypes.walk]: [
        {
            ticks: 10,
            texture: "./data/textures/worker_walk1.png",
            nextFrame: 1
        },
        {
            ticks: 10,
            texture: "./data/textures/worker_walk2.png",
            nextFrame: 0
        }
    ]
}