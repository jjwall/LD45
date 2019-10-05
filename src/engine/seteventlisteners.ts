import { scaleToWindow } from "../scaletowindow";
import { BaseState } from "../basestate";
import { Widget } from "../ui/widget";
import { Entity } from "./entity";
import { last } from "./helpers";
import { Box3 } from "three";

export function setEventListeners(canvas: HTMLCanvasElement, stateStack: BaseState[]) {
    let hoveredWidgets: Widget[] = [];
    // call first to scale to current window dimensions
    scaleToWindow(canvas);

    window.addEventListener("resize", function () {
        scaleToWindow(canvas);
    });

    canvas.addEventListener("click", function (e: MouseEvent) {
        traverseTreeForOnClick(last(stateStack).rootWidget, e);
        canvas.setAttribute("class", "default");
        let selected = false;
        last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
            if (ent.control && ent.sprite && ent.pos) {
                const boundingBox = new Box3().setFromObject(ent.sprite);
                const spriteHeight = boundingBox.max.y - boundingBox.min.y;
                const spriteWidth =  boundingBox.max.x - boundingBox.min.x;

                if (e.offsetY -720 > -ent.pos.loc.y - spriteHeight/2
                    && e.offsetY -720 - spriteHeight/2 < -ent.pos.loc.y
                    && e.offsetX > ent.pos.loc.x - spriteWidth/2
                    && e.offsetX - spriteWidth/2 < ent.pos.loc.x)
                {
                    if (!selected)
                        ent.control.selected = true;
                        
                    selected = true;
                }
                else {
                    ent.control.selected = false;
                }
                console.log(ent.control.selected);
            }
        });
    });

    canvas.addEventListener("contextmenu", function (e: MouseEvent) {
        e.preventDefault();
        last(stateStack).click(e.offsetX, 720 - e.offsetY);
        last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
            if (ent.control) {
                if (ent.control.selected) {
                    ent.control.x = e.offsetX;
                    ent.control.y = 720 - e.offsetY;
                }
            }
        });
    });

    canvas.addEventListener("mousemove", function (e: MouseEvent) {
        traverseTreeForHover(last(stateStack).rootWidget, hoveredWidgets, canvas, e);
    });

    // keyboard controls
    window.onkeydown = function(e: KeyboardEvent) {
        // left
        if (e.keyCode === 37) {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.left = true;
                }
            });
        }

        // right
        if (e.keyCode === 39) {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.right = true;
                }
            });
        }

        // up
        if (e.keyCode === 38 || e.key === 'w') {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.up = true;
                }
            });
        }

        // down
        if (e.keyCode === 40 || e.key === 's') {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.down = true;
                }
            });
        }

        // spacebar
        if (e.keyCode === 90) {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.attack = true;
                }
            });
        }
    }

    window.onkeyup = function(e) {
        // left
        if (e.keyCode === 37) {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.left = false;
                }
            });
        }

        // right
        if (e.keyCode === 39) {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.right = false;
                }
            });
        }

        // up
        if (e.keyCode === 38 || e.key === 'w') {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.up = false;
                }
            });
        }

        // down
        if (e.keyCode === 40 || e.key === 's') {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.down = false;
                }
            });
        }

        // spacebar
        if (e.keyCode === 90) {
            last(stateStack).getEntitiesByKey<Entity>("control").forEach(ent=> {
                if (ent.control) {
                    ent.control.attack = false;
                }
            });
        }
    }
}

function traverseTreeForOnClick(widget: Widget, e: MouseEvent) {
    if (widget.event("click") && widget.attr("height") && widget.attr("width")) {
        const halfWidth: number = Number(widget.attr("width"))/2;
        const halfHeight: number = Number(widget.attr("height"))/2;

        if (e.offsetY > -widget.position.y - halfHeight
            && e.offsetY - halfHeight < -widget.position.y
            && e.offsetX > widget.position.x - halfWidth
            && e.offsetX - halfWidth < widget.position.x)
        {
            // TODO: Make sure only top most widget's click event is triggered.
            // Right now it's triggering all widgets' click events if they are stacked.
            widget.trigger("click", e);
        }
    }

    if (widget.childNodes.length > 0) {
        widget.childNodes.forEach(child => {
            traverseTreeForOnClick(child, e);
        });
    }
}

function traverseTreeForHover(widget: Widget, hoveredWidgets: Widget[], canvas: HTMLCanvasElement, e: MouseEvent) {
    if (widget.event("hover") && widget.event("plunge") && widget.attr("height") && widget.attr("width")) {
        const halfWidth: number = Number(widget.attr("width"))/2;
        const halfHeight: number = Number(widget.attr("height"))/2;
        let widgetIndex: number = hoveredWidgets.indexOf(widget);

        if (e.offsetY > -widget.position.y - halfHeight
            && e.offsetY - halfHeight < -widget.position.y
            && e.offsetX > widget.position.x - halfWidth
            && e.offsetX - halfWidth < widget.position.x)
        {
            if (widgetIndex === -1) {
                hoveredWidgets.push(widget);
                widget.trigger("hover", e);
                
                // TODO: Remove this eventually...
                canvas.setAttribute("class", "pointer");
            }
        }
        else {
            if (widgetIndex > -1) {
                widget.trigger("plunge", e);
                hoveredWidgets.splice(widgetIndex);
                canvas.setAttribute("class", "default");
            }
        }
    }

    if (widget.childNodes.length > 0) {
        widget.childNodes.forEach(child => {
            traverseTreeForHover(child, hoveredWidgets, canvas, e);
        });
    }

}