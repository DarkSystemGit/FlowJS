import Canvas from "canvas";
import sdl from "@kmamal/sdl";
import util from "util";
import ndarray from "ndarray";
import unpack from "ndarray-unpack";
import pack from "ndarray-pack";
import getPixelsImpl from "get-pixels";
import path from "path";
import { readFile } from "node:fs/promises";
const processArr = (array) => {
  return array.flat(1);
};
const getPixels = (...args) => {
  return new Promise((resolve, reject) => {
    getPixelsImpl(...args, (e, p) => {
      !e ? resolve(p) : reject(e);
    });
  });
};
const mousePressed = () => {
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
};
class GFX {
  constructor(screen) {
    this.ctx = screen.ctx;
    this.screen = screen;
  }
  /** Draw a PixelArray or Texture to the screen */
  draw(x, y, z, pixels) {
    return this.screen.draw(
      Canvas.createImageData(pixels._getData(), ...pixels.getShape()),
      x,
      y,
      z,
      pixels.getShape(),
      pixels.getAngle()
    );
  }
  /** Moves a PixelArray or Texture around the screen*/
  moveObject(id, newPosition) {
    this.screen.changeObject(id, newPosition);
  }
  /** Gets an objects data */
  getObject(id) {
    var obj = this.screen._getObject(id);
    return { x: obj.x, y: obj.y, z: obj.z, angle: obj.rotation };
  }
  /** Changes an item's texture */
  changeObjectTexture(id, texture) {
    this.screen.changeObject(id, {
      pixels: Canvas.createImageData(texture._getData(), ...texture.getShape()),
    });
  }
  /** Rotates a object */
  rotateObject(id, degrees) {
    this.screen.changeObject(id, { rotation: degrees });
  }
  /** Fills the screen with a color */
  fillScreen(color) {
    this.screen._clear();
    var fill = new PixelArray(...this.screen.dimensions);
    fill.fill(color || [0, 0, 0, 255]);
    this.draw(0, 0, -Infinity, fill);
  }
  /** Update screen instance */
  updateScreen(screen) {
    this.screen = screen;
  }
}
export class PixelArray {
  constructor(w, h, c, data) {
    this.obj = { data: data || Array(w * h * 4), shape: [w, h, 4] };
  }
  /** Fills the Array */
  fill(color) {
    this.obj.data.fill(color);
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
  /** Get the array's rotation angle */
  getAngle() {
    return 0;
  }
}
export class Texture extends PixelArray {
  constructor(...args) {
    //console.log(args)
    super(...args);
  }
  rotate(degrees) {
    this.rotation = degrees;
  }
  getAngle() {
    return this.rotation;
  }
}
export class Engine {
  constructor(handlerClass, dimensions, scale, title) {
    return (async () => {
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
      this.dimensions = dimensions;
      this.uuid = 0;
      this.objects = new Map();
      this.mouse = [];
      this.assets = new AssetManager();
      var handler = new handlerClass(new GFX(this), this);
      this.onFrame = (a) => handler.onFrame(a) || function () {};
      await handler.onCreate(this);
      var gameLoop = setInterval(() => {
        if (window.destroyed) {
          clearInterval(gameLoop);
          return;
        }
        this._handleEvents();
        this.onFrame(this);
        this._drawObjects();
        window.render(
          ...this.dimensions,
          this.dimensions[0] * 4,
          "bgra32",
          this.canvas.toBuffer("raw")
        );
      }, 16.7);
      return this;
    })();
  }
  /** Loads an asset */
  async loadAsset(path, name) {
    await this.assets.loadTexture(path, name);
  }
  /** Lists assets */
  listAssets() {
    return this.assets.listTextures();
  }
  /** Removes an asset */
  removeAsset(name) {
    this.assets.removeTexture(name);
  }
  /** Converts a loaded asset to a texture */
  convertAssetToTexture(name) {
    return this.assets.getTexture(name);
  }
  /** Draws an object to the screen, returns a object id */
  draw(pixels, x, y, z, shape, angle, oldid) {
    var id = oldid || JSON.parse(JSON.stringify(this.uuid));
    this.objects.set(z, this.objects.get(z) || []);
    this.objects
      .get(z)
      .push({ x, y, z, pixels, shape, id, rotation: angle || 0 });
    if (!oldid) this.uuid++;
    return id;
  }
  /** Changes an object */
  changeObject(id, newObj) {
    var item;
    Array.from(this.objects.values()).forEach((z) =>
      z.forEach((i, c) => {
        if (i.id == id) {
          item = i;
          delete z[c];
        }
      })
    );
    Object.keys(newObj).forEach((k) => (item[k] = newObj[k]));
    this.draw(
      item.pixels,
      item.x,
      item.y,
      item.z,
      item.shape,
      item.rotation,
      item.id
    );
  }
  /** Internal method that actually draws to the screen */
  _drawObjects() {
    var zaxis = Array.from(this.objects.keys()).sort((a, b) => a - b);
    zaxis.forEach((z) =>
      this.objects.get(z).forEach((item) => {
        if (item.rotation) {
          this.ctx.save();
          this.ctx.translate(
            item.x + item.shape[0] / 2,
            item.y + item.shape[1] / 2
          );
          this.ctx.rotate((Math.PI * item.rotation) / 360);
          var tmpCanvas = Canvas.createCanvas(item.shape[0], item.shape[1]);
          var tmpCtx = tmpCanvas.getContext("2d");
          tmpCtx.putImageData(item.pixels, 0, 0);
          this.ctx.drawImage(tmpCanvas, -item.shape[0] / 2, -item.shape[1] / 2);
          this.ctx.restore();
        } else {
          this.ctx.putImageData(item.pixels, item.x, item.y);
        }
      })
    );
  }
  /** internal method to get Object */
  _getObject(id) {
    var item;
    Array.from(this.objects.values()).forEach((z) =>
      z.forEach((i, c) => {
        if (i.id == id) {
          item = i;
        }
      })
    );
    return item;
  }
  /** Internal method to clear screen */
  _clear() {
    this.objects.clear();
  }
  /** Internal method that registers a event with the engine */
  _registerEvent(event, handler) {
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
      if (
        keys[sdl.keyboard.SCANCODE[key]] ||
        (key == "*" && keys.includes(true))
      )
        events.keyboard[key].forEach((f) => f(key, this));
    });
    Object.keys(events.mouse).forEach((ev) => {
      if (
        (["button.left", "button.right", "button.middle"].includes(ev) &&
          sdl.mouse.getButton(
            sdl.mouse.BUTTON[ev.split(".")[1].toUpperCase()]
          )) ||
        (ev == "*" &&
          (mousePressed() ||
            !util.isDeepStrictEqual(
              this.mouse[this.mouse.length - 1],
              this.mouse[this.mouse.length - 2]
            )))
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
export class DimensionalArray {
  constructor(data, width, height, ...shape) {
    this.data = ndarray(data.data, [width, height, shape].flat());
  }
  get(...pos) {
    return this.data.get(...pos);
  }
  set(value, ...pos) {
    return this.data.set(...pos, value);
  }
  getShape() {
    return this.data.shape;
  }
  fromArray(arr) {
    pack(arr, this.data);
  }
  toArray() {
    return unpack(this.data);
  }
}
export class AssetManager {
  constructor() {
    this.assets = {};
  }
  async loadTexture(filePath, name) {
    var f = await getPixels(
      await readFile(filePath),
      `image/${path.extname(filePath).replace(".", "")}`
    );
    f = new DimensionalArray(f, ...f.shape);
    this.assets[name] = f;
    return this.assets[name];
  }
  removeTexture(name) {
    delete this.assets[name];
  }
  getTexture(name) {
    return new Texture(
      ...this.assets[name].getShape(),
      this.assets[name].toArray()
    );
  }
  listTextures() {
    return Object.keys(this.assets);
  }
}
