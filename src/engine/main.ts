import { WebGLRenderer } from "three";
import { Resources, loadTextures, loadAudioElements, loadFonts } from "../resourcemanager";
import { BaseState } from "../basestate";
import { last } from "./helpers";
import { setEventListeners } from "./seteventlisteners";
import { MainMenuState } from "./mainmenustate";
import { GameState } from "./gamestate";

loadTextures([
    "./data/textures/cottage.png",
    "./data/textures/girl.png",
    "./data/textures/msknight.png",
    "./data/textures/snow.png",
    "./data/textures/ship1.png",
    "./data/textures/enemy.png",
    "./data/textures/gate.png",
    "./data/textures/explosion.png",
    "./data/textures/marine.png",
    "./data/textures/marine_shoot1.png",
    "./data/textures/marine_shoot2.png",
    "./data/textures/marine_walk1.png",
    "./data/textures/marine_walk2.png",
    "./data/textures/marker1.png",
    "./data/textures/marker2.png",
    "./data/textures/marker3.png",
    "./data/textures/marker4.png",
    "./data/textures/selector.png",
    "./data/textures/worker.png",
    "./data/textures/worker_walk1.png",
    "./data/textures/worker_walk2.png",
    "./data/textures/barracks.png",
    "./data/textures/barracks_wireframe.png",
    "./data/textures/alien1.png",
    "./data/textures/alien2.png",
    "./data/textures/alien3.png",
    "./data/textures/alien4.png",
    "./data/textures/alien5.png",
    "./data/textures/alien6.png",
    "./data/textures/alien7.png",
    "./data/textures/alien8.png",
    "./data/textures/dirt.png",
    "./data/textures/target.png",
]).then((textures) => {
    // cache off textures
    Resources.instance.setTextures(textures);

    loadFonts([
        "./data/fonts/helvetiker_regular_typeface.json"
    ]).then((fonts) => {
        // cache off fonts
        Resources.instance.setFonts(fonts);

        loadAudioElements([
            "./data/audio/Pale_Blue.mp3",
            "./data/audio/alien_hurt.wav",
            "./data/audio/barracks_finish.wav",
            "./data/audio/place_barracks.wav",
            "./data/audio/shoot.wav",
            "./data/audio/shoot1.wav",
            "./data/audio/marine_spawn.wav"
        ]).then((audioElements) => {
            // cache off audio elements
            Resources.instance.setAudioElements(audioElements);

            // start game
            main(<HTMLElement>document.getElementById("canvasContainer"));
        });
    });
});

/**
 * 
 * @param canvasContainer Captured Canvas Container Element
 * 
 * Main function that gets immediately invoked.
 * Only dependecy is the canvas container element. Also triggers the event pump.
 */
function main(canvasContainer: HTMLElement) {
    // set up renderer
    const renderer = new WebGLRenderer();
    renderer.setSize(1280, 720);
    renderer.autoClear = false;

    // append canvas element to canvas container
    canvasContainer.append(renderer.domElement);

    // initialize state stack
    let stateStack: BaseState[] = [];
    let mainMenuState = new MainMenuState(stateStack);
    stateStack.push(mainMenuState);
    // let gameState = new GameState(stateStack);
    // stateStack.push(gameState);

    let fps: number = 0;
    let totalTime: number = 0;
    let currentTime: number = 0;
    // let fpsWidget = BoardhouseUI.CreateWidget();
    // fpsWidget.setText("FPS:");

    // set up event listeners
    setEventListeners(renderer.domElement, stateStack);

    // logic update loop
    setInterval(function (): void {
        if (stateStack.length > 0) {
            // call update on last element in state stack
            last(stateStack).update();
        }
        else {
            throw "No states to update";
        }

        // log FPS
        // fpsWidget.setText("FPS: " + Math.round(fps));
        // BoardhouseUI.ReconcilePixiDom(fpsWidget, app.stage);
    }, 16);

    // render update loop
    function renderLoop(timeStamp: number) {
        requestAnimationFrame(renderLoop);
        currentTime = timeStamp - totalTime;
        totalTime = timeStamp;
        fps = 1 / (currentTime / 1000);
                
        if (stateStack.length > 0) {
            // call render on last element in state stack
            last(stateStack).render(renderer);
        }
        else {
            throw "No states to render";
        }
    }

    // start the render loop
    renderLoop(0);
}