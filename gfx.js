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
  draw(x, y, z, pixels) {
    this.screen.draw(
      Canvas.createImageData(pixels.getData(), ...pixels.getShape()),
      x,
      y,
      z
    );
  }
  fillScreen(color) {
    color = color || [0, 0, 0, 255];
    this.ctx.fillStyle = `rgba(${color.join()})`;
    this.ctx.fillRect(0, 0, ...this.dimensions);
  }
  updateCtx(ctx) {
    this.ctx = ctx;
  }
}
export class PixelArray {
  constructor(w, h) {
    this.obj = { data: [], shape: [w, h, 4] };
  }
  set(x, y, value) {
    this.obj.data[x * this.obj.shape[0] + y] = value;
  }
  getData() {
    var arr = processArr(this.obj.data);
    var r = new Uint8ClampedArray(arr.length);
    r.set(arr, 0);
    return r;
  }
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
      this.handleEvents();
      this.onFrame();
      this.drawObjects();
      window.render(
        ...this.dimensions,
        this.dimensions[0] * 4,
        "bgra32",
        this.canvas.toBuffer("raw")
      );
    }, 16.7);
  }
  draw(pixels, x, y, z) {
    this.objects.set(z, this.objects.get(z) || []);
    this.objects.get(z).push({ x, y, pixels });
  }
  drawObjects() {
    var zaxis = Array.from(this.objects.keys()).sort((a, b) => a - b);
    zaxis.forEach((z) =>
      this.objects
        .get(z)
        .forEach((item) => this.ctx.putImageData(item.pixels, item.x, item.y))
    );
  }
  onFrame() {}
  registerEvent(event, handler) {
    this.events[event.split(".")[0]] = this.events[event.split(".")[0]] || {};
    this.events[event.split(".")[0]][event.split(".")[1]] =
      this.events[event.split(".")[0]][event.split(".")[1]] || [];
    this.events[event.split(".")[0]][event.split(".")[1]].push(handler);
  }
  handleEvents() {
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
