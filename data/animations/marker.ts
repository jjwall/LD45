import { AnimationSchema } from "../../src/engine/engineinterfaces";
import { SequenceTypes } from "../../src/engine/enums";

export const markerAnim: AnimationSchema = {
    [SequenceTypes.idle]: [
        {
            ticks: 10,
            texture: "./data/textures/marker1.png",
            nextFrame: 1
       },
        {
            ticks: 10,
            texture: "./data/textures/marker2.png",
            nextFrame: 2
       },
        {
            ticks: 10,
            texture: "./data/textures/marker3.png",
            nextFrame: 3
       },
        {
            ticks: 10,
            texture: "./data/textures/marker4.png",
            nextFrame: 3
       },
    ],
}