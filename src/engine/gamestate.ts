import { initializeAnimation, initializeControls, initializeHitBox, initializeHurtBox, initializeSprite, initializePosition, initializeVelocity, initializeTimer } from "./initializers";
import { positionSystem, collisionSystem, timerSystem, animationSystem, velocitySystem, followSystem, spawnerSystem, animControlSystem, marineAttackSystem, deathSystem } from "./coresystems";
import { Scene, Camera, Color, WebGLRenderer, OrthographicCamera, Vector2, Vector3 } from "three";
import { setHurtBoxGraphic, playAudio, setHitBoxGraphic } from "./helpers";
import { HurtBoxTypes, SequenceTypes } from "./enums";
import { controlSystem } from "./controlsystem";
import { Entity } from "./entity";
import { markerAnim } from "../../data/animations/marker";
import { marineAnim } from "../../data/animations/marine";
import { BaseState } from "../basestate";
import { Widget } from "../ui/widget";
import { createWidget } from "../ui/widget";
import { layoutWidget } from "../ui/layoutwidget";
import { renderGameUi, GameRoot } from "./rootgameui";
import { LoseState } from "./losestate";
import { workerAnim } from "../../data/animations/worker";
import { alienAnim } from "../../data/animations/alien";

// TODO: (done) Add scoring and health HP UI
// TODO: Make better assets
// TODO: Make lose screen and lose conditions
// TODO: Add background

/**
 * GameState that handles updating of all game-related systems.
 */
export class GameState extends BaseState {
    public gameScene: Scene;
    public gameCamera: Camera;
    public uiScene: Scene;
    public uiCamera: Camera;
    public rootWidget: Widget;
    public rootComponent: GameRoot;
    public aliens: Entity[] = [];
    public alienTargets: Entity[] = [];
    constructor(stateStack: BaseState[]) {
        super(stateStack);
        // Set up game scene.
        this.gameScene = new Scene();
        this.gameScene.background = new Color("#FFFFFF");

        // Set up game camera.
        this.gameCamera = new OrthographicCamera(0, 1280, 720, 0, -1000, 1000);

        // Set up ui scene.
        this.uiScene = new Scene();

        // Set up ui camera.
        this.uiCamera = new OrthographicCamera(0, 1280, 0, -720, -1000, 1000);

        // Set up ui widget and instance.
        this.rootWidget = createWidget("root");
        this.rootComponent = renderGameUi(this.uiScene, this.rootWidget, this.pushLoseState);

        // Register systems.
        this.registerSystem(controlSystem, "control");
        this.registerSystem(velocitySystem);
        this.registerSystem(animControlSystem);
        this.registerSystem(collisionSystem);
        this.registerSystem(animationSystem);
        this.registerSystem(timerSystem);
        this.registerSystem(positionSystem);
        this.registerSystem(animControlSystem);
        this.registerSystem(spawnerSystem);
        this.registerSystem(marineAttackSystem);
        this.registerSystem(followSystem);
        this.registerSystem(deathSystem);

        // playAudio("./data/audio/Pale_Blue.mp3", 0.3, true);

        // Set up player entity.
        let marine1 = new Entity();
        marine1.pos = initializePosition(640, 360, 5);
        marine1.sprite = initializeSprite("./data/textures/marine.png", this.gameScene, 4);
        marine1.control = initializeControls(marine1.pos.loc.x, marine1.pos.loc.y);
        marine1.anim = initializeAnimation(SequenceTypes.idle, marineAnim);
        marine1.marine = {};
        // player.vel = initializeVelocity(.65);
        // player.vel.friction = 0.9;
        // player.anim = initializeAnimation(SequenceTypes.walk, playerAnim);
        // marine1.hurtBox = initializeHurtBox(marine1.sprite, HurtBoxTypes.marine);//, 50, 50, -300, -100);
        marine1.hurtBox = initializeHurtBox(marine1.sprite, HurtBoxTypes.marine);
        marine1.hit = { points: 100 };
        // setHurtBoxGraphic(marine1.sprite, marine1.hurtBox);
        marine1.hurtBox.onHurt = () => {
            marine1.hit.points--;
            if (marine1.hit.points <= 0) {
                if (marine1.marine.target) {
                    this.gameScene.remove(marine1.marine.target.targeted.sprite);
                    this.removeEntity(marine1.marine.target.targeted);
                }
                if (marine1.control.selected) {
                    this.gameScene.remove(marine1.control.selector.sprite);
                    this.removeEntity(marine1.control.selector);
                }
            }
        }
        this.alienTargets.push(marine1);
        
        this.registerEntity(marine1);

        let worker1 = new Entity();
        worker1.pos = initializePosition(740, 360, 5);
        worker1.sprite = initializeSprite("./data/textures/worker.png", this.gameScene, 4);
        worker1.control = initializeControls(worker1.pos.loc.x, worker1.pos.loc.y);
        worker1.anim = initializeAnimation(SequenceTypes.idle, workerAnim);
        worker1.worker = {};
        // marine2.hurtBox = initializeHurtBox(marine1.sprite, HurtBoxTypes.player);

        this.registerEntity(worker1);

        // let alien1 = new Entity();
        // alien1.pos = initializePosition(700, 250, 5);
        // alien1.sprite = initializeSprite("./data/textures/alien1.png", this.gameScene, 4);
        // alien1.anim = initializeAnimation(SequenceTypes.walk, alienAnim);
        // alien1.followsEntity = { entityToFollow: marine1 };
        // this.aliens.push(alien1);
        
        // this.registerEntity(alien1);

        // Set up background elements (10 wide, 6 tall);
        let dirtX = 64;
        let dirtY = 64;
        let count = 0; // temp
        
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 6; c++) {
                let dirt = new Entity();
                dirt.pos = initializePosition(dirtX, dirtY, 1);
                dirt.sprite = initializeSprite("./data/textures/dirt.png", this.gameScene, 4);
                this.registerEntity(dirt);
                dirtY += 128;
                count++
            }
            dirtY = 64;
            dirtX += 128;
        }
        console.log(count);

        this.setUpEnemySpawner(1260, 700);
        this.setUpEnemySpawner(20, 700);
        this.setUpEnemySpawner(1260, 20);
        this.setUpEnemySpawner(20, 20);
    }

    private setUpEnemySpawner(xPos: number, yPos: number) {
        let spawner = new Entity();

        spawner.spawner = { randomNumber: 750, spawnTime: 0, spawnEntity: (): Entity => {
            let alien = new Entity();
            alien.pos = initializePosition(xPos, yPos, 4);
            alien.sprite = initializeSprite("./data/textures/alien1.png", this.gameScene, 4);
            alien.anim = initializeAnimation(SequenceTypes.walk, alienAnim);
            alien.hitBox = initializeHitBox(alien.sprite, [HurtBoxTypes.worker, HurtBoxTypes.marine, HurtBoxTypes.barracks]);
            // enemy.hurtBox = initializeHurtBox(enemy.sprite, HurtBoxTypes.enemy);
            alien.followsEntity = { entityToFollow: this.alienTargets[Math.floor(Math.random()*this.alienTargets.length)] };
            alien.hit = { points: 100 };
            this.aliens.push(alien);
            // setHitBoxGraphic(enemy.sprite, enemy.hitBox);
            // alien.hitBox.onHit = () => {
            //     this.rootComponent.subtractPlayerHealth();
            //     //this.pushLoseState();
            // }
            // alien.hurtBox.onHurt = () => {
            //     this.removeEntity(alien);
            //     this.rootComponent.addScoreFromEnemyKill();
            //     // Remove Enemy from scene.
            //     this.gameScene.remove(alien.sprite);
            // }

            return alien;
        }};

        this.registerEntity(spawner);
    }

    private screenShake() {
        for (let i = 1; i < 10; i++) {
            let randomYVal = Math.floor(Math.random() * (8 - 0 + 1)) + 0;
            let randomXVal = Math.floor(Math.random() * (8 - 0 + 1)) + 0;
            randomYVal *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
            randomXVal *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
            this.gameCamera.translateX(randomXVal);
            this.gameCamera.translateY(randomYVal);
            let timer = new Entity();
            timer.timer = initializeTimer(2 * i, () => {
                this.gameCamera.translateX(randomXVal * -1);
                this.gameCamera.translateY(randomYVal * -1);
            });
            this.registerEntity(timer);
        }
    }

    public click(x: number, y: number) {
        let marker = new Entity();
        marker.pos = initializePosition(x, y, 5);
        marker.sprite = initializeSprite("./data/textures/marker1.png", this.gameScene, 2);
        marker.anim = initializeAnimation(SequenceTypes.idle, markerAnim);
        marker.timer = initializeTimer(40, () => {
            this.gameScene.remove(marker.sprite);
            this.removeEntity(marker);
        });

        this.registerEntity(marker);
    }

    public pushLoseState = (): void => {
        let loseState = new LoseState(this.stateStack, this.rootComponent.state.score);
        this.stateStack.push(loseState);
    }

    public update() : void {
        this.runSystems(this);
    }

    public render(renderer: WebGLRenderer) : void {
        renderer.clear();
        renderer.render(this.gameScene, this.gameCamera);
        renderer.clearDepth();
        renderer.render(this.uiScene, this.uiCamera);

        // Render UI updates.
        layoutWidget(this.rootWidget);
    }
}