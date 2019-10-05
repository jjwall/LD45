// /** @jsx createJSXElement */
import { createJSXElement } from "../ui/createjsxelement";
import { JSXElement, ComponentInstance } from "../ui/interfaces";
import { renderWidget } from "../ui/renderwidget";
import { Scene } from "THREE";
import { Widget } from "../ui/widget";
import { Component } from "../ui/component";

export function renderLoseUi(scene: Scene, rootWidget: Widget, goToMainMenu: () => void, score: number): LoseRoot {
    let rootInstance = renderWidget(
                                    <LoseRoot goToMainMenu = {goToMainMenu}
                                    score = {score}/>, 
                                    rootWidget, 
                                    scene
                                );

    return rootInstance.component as LoseRoot;
}

interface Props {
    goToMainMenu: () => void;
    score: number;
}

interface State {
    panelColor: string;
    fontColor: string;
    start: boolean;
}

export class LoseRoot extends Component<Props, State> {
    constructor(props: Props, scene: Scene) {
        super(props, scene);
        this.state = {
            panelColor: "#228B22",
            fontColor: "#0000FF",
            start: false,
        }
    }

    public hover = (): void => {
        this.setState({
            fontColor: "#FF0000",
            panelColor: "#00FFFF"
        });
    }

    public plunge = (): void => {
        this.setState({
            fontColor: "#0000FF",
            panelColor: "#228B22"
        });
    }

    public triggerGoToMainMenu = (): void => {
        this.props.goToMainMenu();
    }

    render(): JSXElement {
        return(
            <panel>
                <label contents="Score:" top="290" left="640"></label>
                <label contents={" " + this.props.score} color="#0000FF" top="315" left="630"></label>
                <panel height="70" width="300" color={this.state.panelColor} top="360" left="640"
                    onHover={() => this.hover()}
                    onPlunge={() => this.plunge()}
                    onClick={() => this.triggerGoToMainMenu()}>
                    <label top="10" color={this.state.fontColor} contents="main menu"></label>
                </panel>
            </panel>
        )
    }
}