import { AnimationSchema } from "../../src/engine/engineinterfaces";
import { SequenceTypes } from "../../src/engine/enums";

export const alienAnim: AnimationSchema = {
    [SequenceTypes.walk]: [
        {
            ticks: 5,
            texture: "./data/textures/alien1.png",
            nextFrame: 1
        },
        {
            ticks: 5,
            texture: "./data/textures/alien2.png",
            nextFrame: 2
        },
        {
            ticks: 5,
            texture: "./data/textures/alien3.png",
            nextFrame: 3
        },
        {
            ticks: 5,
            texture: "./data/textures/alien4.png",
            nextFrame: 4
        },
        {
            ticks: 5,
            texture: "./data/textures/alien5.png",
            nextFrame: 5
        },
        {
            ticks: 5,
            texture: "./data/textures/alien6.png",
            nextFrame: 6
        },
        {
            ticks: 5,
            texture: "./data/textures/alien7.png",
            nextFrame: 7
        },
        {
            ticks: 5,
            texture: "./data/textures/alien8.png",
            nextFrame: 0
        }
    ]
}