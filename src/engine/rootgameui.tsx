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
}

export class GameRoot extends Component<Props, State> {
    constructor(props: Props, scene: Scene) {
        super(props, scene);
        this.state = {
            score: 0,
            playerHealth: 100,
        };

        setInterval(() => this.addHealth(), 1000);
    }

    public addScoreFromGate = (): void => {
        this.setState({
            score: this.state.score + 100
        });
    }

    public addScoreFromEnemyKill = (): void => {
        this.setState({
            score: this.state.score + 50
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

    render(): JSXElement {
        return(
            <panel>
                <panel>
                    <label contents="Score:" top="50" left="50"></label>
                    <label contents={" " + this.state.score} color="#0000FF" top="75" left="40"></label>
                    <label contents="Health:" top="100" left="50"></label>
                    <label contents={" " + this.state.playerHealth} color="#FF0000" top="125" left="40"></label>
                </panel>
            </panel>
        )
    }
}