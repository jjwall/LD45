// /** @jsx createJSXElement */
import { createJSXElement } from "../ui/createjsxelement";
import { JSXElement, ComponentInstance } from "../ui/interfaces";
import { renderWidget } from "../ui/renderwidget";
import { Scene } from "THREE";
import { Widget } from "../ui/widget";
import { Component } from "../ui/component";

export function renderGameUi(scene: Scene, rootWidget: Widget, pushLoseState: () => void): GameRoot {
    let rootInstance = renderWidget(<GameRoot pushLoseState = {pushLoseState} />, rootWidget, scene);

    return rootInstance.component as GameRoot;
}

interface Props {
    pushLoseState: () => void;
}

interface State {
    score: number;
    playerHealth: number;
    displayWorkerUi: boolean;
}

export class GameRoot extends Component<Props, State> {
    constructor(props: Props, scene: Scene) {
        super(props, scene);
        this.state = {
            score: 0,
            playerHealth: 100,
            displayWorkerUi: false,
        };

        setInterval(() => this.addHealth(), 1000);
    }

    public addScoreFromGate = (): void => {
        this.setState({
            score: this.state.score + 100
        });
    }

    public addScoreFromEnemyHurt = (): void => {
        this.setState({
            score: this.state.score + 1
        });
    }

    public addScoreFromBarracks = (): void => {
        this.setState({
            score: this.state.score + 500
        });
    }

    public subtractPlayerHealth = (): void => {
        this.setState({
            playerHealth: this.state.playerHealth - 1
        });

        if (this.state.playerHealth <= 0) {
            this.triggerPushLoseState();
        }
    }

    public addHealth = (): void => {
        if (this.state.playerHealth < 100) {
            this.setState({
                playerHealth: this.state.playerHealth + 1
            });
        }
    }

    public triggerPushLoseState() {
        this.props.pushLoseState();
    }

    public toggleWorkerUiOn() {
        if (!this.state.displayWorkerUi) {
            this.setState({
                displayWorkerUi: !this.state.displayWorkerUi
            });
        }
    }

    public toggleWorkerUiOff() {
        if (this.state.displayWorkerUi) {
            this.setState({
                displayWorkerUi: !this.state.displayWorkerUi
            });
        }
    }
    render(): JSXElement {
        if (this.state.displayWorkerUi) {
            return(
                    <panel>
                        <label contents="Score:" top="50" left="50"></label>
                        <label contents={" " + this.state.score} color="#0000FF" top="75" left="40"></label>
                        <panel left="1100" top ="600" height="190" width="300" color="#282828"></panel>
                        <panel left="1100" top ="540" height="50" width="280" color="#A9A9A9" z_index>
                            <label contents="B - Build Barracks" top="7"></label>
                        </panel>
                        <panel left="1100" top ="600" height="50" width="280" color="#A9A9A9"></panel>
                        <panel left="1100" top ="660" height="50" width="280" color="#A9A9A9"></panel>
                    </panel>
            )
        }
        else {
            return(
                    <panel>
                        <label contents="Score:" top="50" left="50"></label>
                        <label contents={" " + this.state.score} color="#0000FF" top="75" left="40"></label>
                        <panel left="1100" top ="6000" height="190" width="300" color="#228B22"></panel>
                        <panel left="1100" top ="5400" height="50" width="280" color="#00FFFF" z_index>
                            <label contents="B - Build Barracks" top="7"></label>
                        </panel>
                        <panel left="1100" top ="6000" height="50" width="280" color="#00FFFF"></panel>
                        <panel left="1100" top ="6600" height="50" width="280" color="#00FFFF"></panel>
                    </panel>
            )
        }
    }
}