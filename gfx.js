import Canvas from "canvas";
import sdl from "@kmamal/sdl";
import util from "util";
const processArr = (array, factor, shape) => {
  return (
    array
      /*.map((r) => {
      return Array(Math.ceil(factor[0])).fill(
        r.flatMap((i) => Array(Math.ceil(factor[1])).fill(i))
      );
    })*/
      .flat(1)
  );
};
export class GFX {
  constructor(screen) {
    this.ctx = screen.ctx;
    this.screen = screen;
  }
  /** Draw a PixelArray or Texture to the screen */
  draw(x, y, z, pixels) {
    this.screen.draw(
      Canvas.createImageData(pixels._getData(), ...pixels.getShape()),
      x,
      y,
      z
    );
  }
  /** Fills the screen with a color */
  fillScreen(color) {
    this.screen._clear()
    var fill=new PixelArray(...this.screen.dimensions)
    fill.fill(color || [0, 0, 0, 255]);
    this.draw(0,0,-Infinity,fill)
   
  }
  /** Update screen instance */
  updateScreen(screen) {
    this.screen = screen;
  }
}
export class PixelArray {
  constructor(w, h) {
    this.obj = { data: Array(w*h*4), shape: [w, h, 4] };
  }
  /** Fills the Array */
  fill(color){
    this.obj.data.fill(color)
  }
  /** Sets a pixel in the array */
  set(x, y, value) {
    this.obj.data[x * this.obj.shape[0] + y] = value;
  }
  /** Internal method to get the array's data */
  _getData() {
    var arr = processArr(this.obj.data);
    var r = new Uint8ClampedArray(arr.length);
    r.set(arr, 0);
    return r;
  }
  /** Get the array's dimensions, [width, height] */
  getShape() {
    return this.obj.shape;
  }
}
export class Screen {
  constructor(dimensions, scale, title) {
    const window = (this.window = sdl.video.createWindow({
      resizable: false,
      accelerated: true,
      title,
      width: dimensions[0],
      height: dimensions[1],
    }));
    this.events = { keyboard: {}, mouse: {} };
    this.canvas = Canvas.createCanvas(...dimensions);
    this.ctx = this.canvas.getContext("2d");
    this.scale = scale;
    this.objects = new Map();
    this.dimensions = dimensions;
    this.mouse = [];
    var gameLoop = setInterval(() => {
      if (window.destroyed) {
        clearInterval(gameLoop);
        return;
      }
      this._handleEvents();
      this.onFrame();
      this._drawObjects();
      window.render(
        ...this.dimensions,
        this.dimensions[0] * 4,
        "bgra32",
        this.canvas.toBuffer("raw")
      );
    }, 16.7);
  }
  /** Draws an object to the screen */
  draw(pixels, x, y, z) {
    this.objects.set(z, this.objects.get(z) || []);
    this.objects.get(z).push({ x, y, pixels });
  }
  /** Internal method that actually draws to the screen */
  _drawObjects() {
    var zaxis = Array.from(this.objects.keys()).sort((a, b) => a - b);
    zaxis.forEach((z) =>
      this.objects
        .get(z)
        .forEach((item) => this.ctx.putImageData(item.pixels, item.x, item.y))
    );
  }
  /** Internal method to clear screen */
  _clear(){
    this.objects.clear()
  }
  /** Implemented by subclass, runs on each frame*/
  onFrame() {}
  /** Registers a event with the engine */
  registerEvent(event, handler) {
    this.events[event.split(".")[0]] = this.events[event.split(".")[0]] || {};
    this.events[event.split(".")[0]][event.split(".")[1]] =
      this.events[event.split(".")[0]][event.split(".")[1]] || [];
    this.events[event.split(".")[0]][event.split(".")[1]].push(handler);
  }
  /** Internal method to handle events*/
  _handleEvents() {
    var events = this.events;
    this.mouse.push(sdl.mouse.position);
    var keys = sdl.keyboard.getState();
    Object.keys(events.keyboard).forEach((key) => {
      if (keys[sdl.keyboard.SCANCODE[key]])
        events.keyboard[key].forEach((f) => f(this));
    });
    Object.keys(events.mouse).forEach((ev) => {
      if (
        ["button.left", "button.right", "button.middle"].includes(ev) &&
        sdl.mouse.getButton(sdl.mouse.BUTTON[ev.split(".")[1].toUpperCase()])
      ) {
        events.mouse[ev].forEach((f) => f(this));
      }
      if (ev == "move") {
        //the following if statement was sponsered by bad langauge design choices
        if (
          this.mouse.length > 1 &&
          !util.isDeepStrictEqual(
            this.mouse[this.mouse.length - 1],
            this.mouse[this.mouse.length - 2]
          )
        )
          events.mouse[ev].forEach((f) =>
            f(this.mouse[this.mouse.length - 2], this)
          );
      }
    });
  }
}
