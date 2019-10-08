import { Scene, Camera, Color, WebGLRenderer, OrthographicCamera } from "three";
import { BaseState } from "../basestate";
import { layoutWidget } from "../ui/layoutwidget";
import { Widget, createWidget } from "../ui/widget";
import { LoseRoot, renderLoseUi } from "./rootloseui"
import { renderMainMenuUi, MainMenuRoot } from "./rootmainmenuui";
import { MainMenuState } from "./mainmenustate";

export class LoseState extends BaseState {
    public uiScene: Scene;
    public uiCamera: Camera;
    public rootWidget: Widget;
    constructor(stateStack: BaseState[], score: number) {
        super(stateStack);

        // Set up ui scene.
        this.uiScene = new Scene();
        this.uiScene.background = new Color("#FFFFFF");

        // Set up ui camera.
        this.uiCamera = new OrthographicCamera(0, 1280, 0, -720, -1000, 1000);

        // Set up ui widget and instance.
        this.rootWidget = createWidget("root");
        //let rootComponent = 
        renderLoseUi(this.uiScene, this.rootWidget, this.goToMainMenu, score);
    }

    private goToMainMenu = (): void => {
        this.stateStack.pop();
        this.stateStack.pop();
        let mainMenuState = new MainMenuState(this.stateStack);
        this.stateStack.push(mainMenuState);
    }

    public update(): void {}

    public render(renderer: WebGLRenderer) : void {
        renderer.clear();
        renderer.clearDepth();
        renderer.render(this.uiScene, this.uiCamera);

        // Render UI updates.
        layoutWidget(this.rootWidget);
    }
    
    public click(x: number, y: number) {
        console.log("click");
    }
}