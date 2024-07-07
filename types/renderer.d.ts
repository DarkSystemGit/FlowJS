export class Renderer {
    constructor(title: any, dimensions: any, scale: any);
    dimensions: any;
    scale: any;
    window: any;
    screenCanvas: any;
    screenCtx: any;
    gl: GlRenderer;
    setShader(shader: any): void;
    setShaderProps(props: any): void;
    render(framebuffer: any): void;
    getMousePos(): {
        x: number;
        y: number;
    };
    getPressedKeys(): any;
    keyPressed(key: any): any;
    mousePressed(): boolean;
    mouseButtonPressed(button: any): any;
}
import { GlRenderer } from "./glRenderer.js";
