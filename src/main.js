import Canvas from "canvas";
import sdl from "@kmamal/sdl";
import util from "node:util";
import brc from "fast-brc";
import classMethods from "class-methods";
import jpeg from "jpeg-js";
import { getFormat } from "@unpic/pixels";
import { PNG } from "pngjs";
import { readFile } from "node:fs/promises";
function createImageBitmap(pix, w, h) {
  var tmpCanvas = Canvas.createCanvas(w, h);
  tmpCanvas.getContext("2d").putImageData(pix, 0, 0);
  return tmpCanvas;
}
const processArr = (array) => {
  return array.flat(1);
};
const getPixels = async (file) => {
  var format = getFormat(file);
  if (format == "png") {
    var pix = PNG.sync.read(file);
  } else if (format == "jpg") {
    var pix = jpeg.decode(file);
  }
  return {
    shape: [pix.width, pix.height],
    data: Uint8ClampedArray.from(pix.data),
  };
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
  /**
   * Drawing interface
   * @param {Screen} screen Screen object
   */
  constructor(screen) {
    this.ctx = screen.ctx;
    this.screen = screen;
  }
  /**
   * Draw a PixelArray or Texture to the screen
   * @param {Number} x X cord
   * @param {Number} y Y cord
   * @param {Number} z Z cord
   * @param {PixelArray|Texture} pixels PixelArray or Texture to draw
   * @returns {Number}
   */
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
  /**
   * Moves a Object around the screen
   * @param {Number} id Object ID
   * @param {Object} newPosition New Position
   * @param {Number} newPosition.x X Cord
   * @param {Number} newPosition.y Y Cord
   *  @param {number} newPosition.z Z Cord
   */
  moveObject(id, newPosition) {
    this.screen.changeObject(id, newPosition);
  }
  /**
   * Gets an objects data
   * @param {number} id Object ID
   * @returns {object}
   */
  getObject(id) {
    var obj = this.screen._getObject(id);
    return { x: obj.x, y: obj.y, z: obj.z, angle: obj.rotation };
  }
  /**
   * Changes an object's texture
   * @param {number} id Object ID
   * @param {Texture|PixelArray} texture New Texture
   */
  changeObjectTexture(id, texture) {
    this.screen.changeObject(id, {
      pixels: Canvas.createImageData(texture._getData(), ...texture.getShape()),
    });
  }
  /**
   * Rotates a object
   * @param {number} id Object ID
   * @param {number} degrees Rotation Angle
   */
  rotateObject(id, degrees) {
    this.screen.changeObject(id, { rotation: degrees });
  }
  /**
   * Fills the screen with a color
   * @param {Array<number>} color RGBA color
   */
  fillScreen(color) {
    this.screen._clear();
    var fill = new PixelArray(...this.screen.dimensions);
    fill.fill(color || [0, 0, 0, 255]);
    this.draw(0, 0, -Infinity, fill);
  }
  /**
   * Update screen instance
   * @param {Screen} screen Screen object
   */
  updateScreen(screen) {
    this.screen = screen;
  }
}
export class PixelArray {
  constructor(w, h, data) {
    this.obj = { data: data || Array(w * h * 4), shape: [w, h, 4] };
  }
  /**
   * Fills the Array
   * @param {Array<number>} color RGBA color
   */
  fill(color) {
    this.obj.data.fill(color);
  }
  /**
   * Sets a pixel in the array
   * @param {Number} x X cord
   * @param {Number} y Y cord
   * @param {Array<Number>} value RGBA color
   */
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
  /**
   * Get the array's dimensions
   * @returns {Array<Number>}
   */
  getShape() {
    return this.obj.shape;
  }
  /** Get the array's rotation angle
   * @returns {Number}
   */
  getAngle() {
    return 0;
  }
}
export class Texture extends PixelArray {
  constructor(...args) {
    super(...args);
  }
  /**
   * Rotates a Texture
   * @param {Number} degrees Degrees to rotate
   */
  rotate(degrees) {
    this.rotation = degrees;
  }
  getAngle() {
    return this.rotation;
  }
}
export class Engine {
  /**
   * Game Engine
   * @param {*} handlerClass Game class
   * @param {*} dimensions Screen dimensions
   * @param {*} scale Scale factor
   * @param {*} title Window Title
   * @returns
   */
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
      classMethods(handlerClass).forEach((method) => {
        if (!["onCreate", "onFrame"].includes(method)) {
          if(method=="onKeyPress")this._registerEvent('keyboard.*',handler.onKeyPress)
        }
      });
      this.onFrame = (a) => handler.onFrame(a) || function () {};
      await handler.onCreate(this);
      var loop=async () => {
        if (window.destroyed) {
          return;
        }
        this._handleEvents();
        this.onFrame(this);
        await this._drawObjects();
        window.render(
          ...this.dimensions,
          this.dimensions[0] * 4,
          "bgra32",
          this.canvas.toBuffer("raw")
        );
        setTimeout(loop,0)
      }
      setTimeout(loop, 0);
      return this;
    })();
  }
  /**
   * Loads an asset
   * @param {String} path Path to file
   * @param {String} name Name of asset
   */
  async loadAsset(path, name) {
    await this.assets.loadTexture(path, name);
  }
  /** Lists loaded assets
   * @returns {Array<String>}
   */
  listAssets() {
    return this.assets.listTextures();
  }
  /**
   * Removes an asset from storage
   * @param {String} name Name of asset
   */
  removeAsset(name) {
    this.assets.removeTexture(name);
  }
  /**
   * Converts a loaded asset to a texture
   * @param {String} name Name of asset
   * @returns {Texture}
   */
  convertAssetToTexture(name) {
    return this.assets.getTexture(name);
  }
  /**
   * Draws an object to the screen, returns a object id
   * @param {ImageData} pixels Object's ImageData
   * @param {Number} x X cord
   * @param {Number} y Y cord
   * @param {Number} z Z cord
   * @param {Array<number>} shape Dimensions
   * @param {Number} angle Rotation Angle
   * @param {Number} oldid
   * @returns {Number} Object ID
   */
  draw(pixels, x, y, z, shape, angle, oldid) {
    var id = oldid || JSON.parse(JSON.stringify(this.uuid));
    this.objects.set(z, this.objects.get(z) || []);
    this.objects
      .get(z)
      .push({ x, y, z, pixels, shape, id, rotation: angle || 0 });
    if (!oldid) this.uuid++;
    return id;
  }
  /**
   *  Changes an object
   * @param {Number} id Object ID
   * @param {Object} newObj Updated Properties
   */
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
  async _drawObjects() {
    var zaxis = Array.from(this.objects.keys()).sort((a, b) => a - b);
    for (var z of zaxis) {
      for (var item of this.objects.get(z)) {
        if (!item) continue;
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
          this.ctx.drawImage(
            createImageBitmap(item.pixels, ...item.shape),
            item.x,
            item.y
          );
        }
      }
    }
  }
  /**
   *  Internal method to get an Object
   * @param {Number} id Object ID
   * @returns
   */
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
  /**
   *  Internal method that registers a event with the engine
   * @param {String} event
   * @param {Function} handler
   */
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
class AssetManager {
  /** Internal class to manage asssets */
  constructor() {
    this.assets = {};
  }
  /**
   * Loads a texture
   * @param {String} file File Path
   * @param {String} name Asset Name
   * @returns {Object} Asset
   */
  async loadTexture(file, name) {
    file = await readFile(file);
    var f = await getPixels(file);
    this.assets[name] = f;
    return this.assets[name];
  }
  /**
   * Deletes a texture from storage
   * @param {String} name Asset Name
   */
  removeTexture(name) {
    delete this.assets[name];
  }
  /**
   * Gets a texture
   * @param {String} name Asset Name
   * @returns
   */
  getTexture(name) {
    return new Texture(
      ...this.assets[name].shape,
      brc({
        numBands: 1,
        data: Array.from(this.assets[name].data),
        //height: this.assets[name].shape[1],
        width: this.assets[name].shape[0],
      }).data[0]
    );
  }
  /**
   * List loaded assets
   * @returns {Array<String>} Asset Names
   */
  listTextures() {
    return Object.keys(this.assets);
  }
}
