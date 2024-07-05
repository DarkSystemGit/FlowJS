import sdl from "@kmamal/sdl";
import Canvas from "canvas";
import { indexesOf} from "./utils.js";
import { GlRenderer } from "./GlRenderer.js";
export class Renderer {
  constructor(title, dimensions, scale) {
    this.dimensions = dimensions;
    this.scale = scale;
    this.window = sdl.video.createWindow({
      resizable: true,
      accelerated: true,
      title,
      width: dimensions[0],
      height: dimensions[1],
      opengl: true,
    });
    this.screenCanvas = Canvas.createCanvas(
      dimensions[0] * this.scale[0],
      dimensions[1] * this.scale[1]
    );
    this.screenCtx = this.screenCanvas.getContext("2d");
    this.gl=new GlRenderer(this.window)
  }
  setShader(shader){
    this.gl.setShader(shader)
  }
  setShaderProps(props){this.gl.setShaderProperty(props)}
  render(framebuffer) {
    if (this.window.destroyed) process.exit(0);
    this.screenCtx.clearRect(
      0,
      0,
      this.screenCanvas.width,
      this.screenCanvas.height
    );
    this.screenCtx.putImageData(
      framebuffer,
      0,
      0,
      0,
      0,
      framebuffer.width * this.scale[0],
      framebuffer.height * this.scale[1]
    );
    this.gl.render(this.dimensions[0],this.dimensions[1],this.screenCanvas.toBuffer("raw"))
    /*this.window.render(
      ...this.dimensions,
      this.dimensions[0] * 4,
      "bgra32",
      this.screenCanvas.toBuffer("raw")
    );*/
  }
  getMousePos() {
    return {
      x: sdl.mouse.position.x - this.window.x,
      y: sdl.mouse.position.y - this.window.y,
    };
  }
  getPressedKeys() {
    return indexesOf(sdl.keyboard.getState(), true).map((i) =>
      sdl.keyboard.getKey(i)
    );
  }
  keyPressed(key) {
    return sdl.keyboard.getState()[
      sdl.keyboard.SCANCODE[sdl.keyboard.getScancode(key)]
    ];
  }
  mousePressed() {
    for (var i = 0; i < 2; i++) {
      if (
        sdl.mouse.getButton(
          [
            sdl.mouse.BUTTON.LEFT,
            sdl.mouse.BUTTON.RIGHT,
            sdl.mouse.BUTTON.MIDDLE,
          ][i]
        )
      )
        return true;
    }
  }
  mouseButtonPressed(button) {
    return sdl.mouse.getButton(sdl.mouse.BUTTON[button.toUpperCase()]);
  }
}
