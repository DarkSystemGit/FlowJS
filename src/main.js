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
const angle = (anchor, point) =>
  (Math.atan2(anchor[1] - point[1], anchor[0] - point[0]) * 180) / Math.PI +
  180;
const colliding = (obj1, obj2) =>
  obj1.x < obj2.x + obj2.width &&
  obj1.x + obj1.width > obj2.x &&
  obj1.y < obj2.y + obj2.height &&
  obj1.y + obj1.height > obj2.y;

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
const indexesOf = (arr, item) =>
  arr.reduce((acc, v, i) => (v === item && acc.push(i), acc), []);
class GFX {
  /**
   * Drawing interface
   * @param {Engine} engine Engine object
   */
  constructor(engine) {
    this.ctx = engine.ctx;
    this.engine = engine;
  }
  /**
   * Draw a PixelArray or Texture to the screen
   * @param {Number} x X cord
   * @param {Number} y Y cord
   * @param {Number} z Z cord
   * @param {PixelArray|Texture} pixels PixelArray or Texture to draw
   * @returns {Number}
   */
  draw(x, y, z, pixels, special) {
    return this.engine.draw(
      Canvas.createImageData(pixels._getData(), ...pixels.getShape()),
      x,
      y,
      z,
      pixels.getShape(),
      pixels.getAngle(),
      undefined,
      special
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
    this.engine.changeObject(id, newPosition);
  }
  /**
   * Gets an objects data
   * @param {number} id Object ID
   * @returns {object}
   */
  getObject(id) {
    var obj = this.engine._getObject(id);
    return { x: obj.x, y: obj.y, z: obj.z, angle: obj.rotation };
  }
  /**
   * Changes an object's texture
   * @param {number} id Object ID
   * @param {Texture|PixelArray} texture New Texture
   */
  changeObjectTexture(id, texture) {
    this.engine.changeObject(id, {
      pixels: Canvas.createImageData(texture._getData(), ...texture.getShape()),
    });
  }
  /**
   * Rotates a object
   * @param {number} id Object ID
   * @param {number} degrees Rotation Angle
   */
  rotateObject(id, degrees) {
    this.engine.changeObject(id, { rotation: degrees });
  }
  /**
   * Fills the screen with a color
   * @param {Array<number>} color RGBA color
   */
  fillScreen(color) {
    this.engine._clear();
    var fill = new PixelArray(
      this.engine.canvas.width,
      this.engine.canvas.height
    );
    fill.fill(color || [0, 0, 0, 255]);
    this.draw(0, 0, -Infinity, fill, ["fs", color]);
  }
  /**
   * Update screen instance
   * @param {Screen} engine Engine object
   */
  updateScreen(engine) {
    this.engine = engine;
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
  /**
   * Gets rotation angle
   * @returns {Number} angle
   */
  getAngle() {
    return this.rotation;
  }
}
export class Engine {
  /**
   * Game Engine
   * @param {Class} handlerClass Game class
   * @param {Array<number>} dimensions Screen dimensions
   * @param {Number} scale Scale factor
   * @param {String} title Window Title
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
      this.screenCanvas = Canvas.createCanvas(
        dimensions[0] * scale[0],
        dimensions[1] * scale[1]
      );
      this.screenCtx = this.screenCanvas.getContext("2d");
      this.scale = scale;
      this.dimensions = dimensions;
      this.uuid = 0;
      this.objects = new Map();
      this.mouse = [];
      this.mouseClicks = [];
      this.camera = [0, 0];
      this.keyboard = [[0, 0]];
      this.assets = new AssetManager();
      var handler = new handlerClass(new GFX(this), this);
      classMethods(handlerClass).forEach((method) => {
        if (!["onCreate", "onFrame"].includes(method)) {
          if (method == "onKeyPress")
            this._registerEvent("keyboard.*", handler.onKeyPress);
          if (method.includes("onMouse")) {
            var mouseEv = method.split("onMouse")[1].toLowerCase();
            if (["middle", "left", "right", "move"].includes(mouseEv))
              this._registerEvent(`mouse.${mouseEv}`, handler[method]);
          }
        }
      });
      this.onFrame = (a) => handler.onFrame(a) || function () {};
      await handler.onCreate(this);
      var gameLoop = async () => {
        if (window.destroyed) {
          return;
        }
        this._handleEvents();
        this.onFrame(this);
        await this._drawObjects();
        this.screenCtx.clearRect(
          0,
          0,
          this.screenCanvas.width,
          this.screenCanvas.height
        );
        this.screenCtx.drawImage(
          this.canvas,
          0,
          0,
          this.canvas.width * this.scale[0],
          this.canvas.height * this.scale[1]
        );
        window.render(
          ...this.dimensions,
          this.dimensions[0] * 4,
          "bgra32",
          this.screenCanvas.toBuffer("raw")
        );
        setTimeout(gameLoop, 0);
      };
      setTimeout(gameLoop, 0);
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
   * Gets current mouse position
   */
  getMousePos() {
    return this.mouse[this.mouse.length - 1];
  }
  /**
   * Sets the camera position
   * @param {Number} x X cord
   * @param {Number} y Y cord
   */
  setCameraPosition(x, y) {
    this.camera = [x || this.camera[0], y || this.camera[1]];
  }
  /**
   * Gets camera position
   * @returns {Array<number>} Camera position
   */
  getCameraPosition() {
    return this.camera;
  }
  /**
   * Moves the camera around
   * @param {Number} x X movement
   * @param {Number} y Y movement
   */
  moveCamera(x, y) {
    this.camera = [this.camera[0] + (x || 0), this.camera[1] + (y || 0)];
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
  draw(pixels, x, y, z, shape, angle, oldid, special) {
    var id = oldid || JSON.parse(JSON.stringify(this.uuid));
    this.objects.set(z, this.objects.get(z) || []);
    this.objects
      .get(z)
      .push({ x, y, z, pixels, shape, id, rotation: angle || 0, special });
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
          if (item.special && item.special[0] == "fs") {
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = `rgba(${item.special[1].join(",")})`;
            this.ctx.fill();
          } else {
            this.ctx.drawImage(
              createImageBitmap(item.pixels, ...item.shape),
              item.x + -1 * this.camera[0],
              item.y + -1 * this.camera[1]
            );
          }
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
  /**
   * Gets colliding objects
   * @param {number} id Object ID
   */
  getObjectCollisions(id) {
    var obj = this._getObject(id);
    return this.objects
      .get(obj.z)
      .map((obj2) => {
        obj.width = obj.shape[0];
        obj.height = obj.shape[1];
        obj2.width = obj2.shape[0];
        obj2.height = obj2.shape[1];
        return {
          id: obj.id,
          col: colliding(obj, obj2),
          angle: angle(
            [obj.x + obj.shape[0] / 2, obj.y + obj.shape[1] / 2],
            [obj2.x + obj2.shape[0] / 2, obj2.y + obj2.shape[1] / 2]
          ),
        };
      })
      .filter((obj2) => obj2.col)
      .map((i) => {
        delete i.col;
        return i;
      })
      .filter((i) => i.id != obj.id);
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
    var keys = sdl.keyboard.getState();
    this.mouse.push({
      x: sdl.mouse.position.x - this.window.x,
      y: sdl.mouse.position.y - this.window.y,
    });
    if (mousePressed()) this.mouseClicks.push(Date.now());
    if (!(indexesOf(keys, true).map((i) => sdl.keyboard.getKey(i)).length == 0))
      this.keyboard.push([
        indexesOf(keys, true).map((i) => sdl.keyboard.getKey(i)),
        Date.now(),
      ]);

    if (
      this.keyboard.length > 1 &&
      this.keyboard[this.keyboard.length - 1][1] -
        this.keyboard[this.keyboard.length - 2][1] >
        20
    ) {
      Object.keys(events.keyboard).forEach((key) => {
        if (
          keys[sdl.keyboard.SCANCODE[sdl.keyboard.getScancode(key)]] ||
          (key == "*" && keys.includes(true))
        ) {
          events.keyboard[key].forEach((f) => {
            if (key == "*")
              key = indexesOf(keys, true).map((i) => sdl.keyboard.getKey(i));
            f(key, this);
          });
        }
      });
    }
    Object.keys(events.mouse).forEach((ev) => {
      if (
        (["left", "right", "middle"].includes(ev) &&
          sdl.mouse.getButton(sdl.mouse.BUTTON[ev.toUpperCase()])) ||
        (ev == "*" &&
          (mousePressed() ||
            !util.isDeepStrictEqual(
              this.mouse[this.mouse.length - 1],
              this.mouse[this.mouse.length - 2]
            )))
      ) {
        if (
          this.mouseClicks.length > 1 &&
          this.mouseClicks[this.mouseClicks.length - 1] -
            this.mouseClicks[this.mouseClicks.length - 2] >
            20
        )
          events.mouse[ev].forEach((f) => f(this));
      }
      if (ev == "move") {
        //the following statement was sponsered by bad langauge design choices
        if (
          this.mouse.length > 1 &&
          !util.isDeepStrictEqual(
            this.mouse[this.mouse.length - 1],
            this.mouse[this.mouse.length - 2]
          )
        )
          events.mouse[ev].forEach((f) =>
            f(this.mouse[this.mouse.length - 1], this)
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
/**
 * Game interface to be implemented by user
 * @member {GFX} gfx
 * @property {Engine} engine
 */
export class Game {
  constructor(gfx, engine) {
    this.gfx = gfx;
    this.engine = engine;
  }
  /**
   * Called on each frame
   */
  onFrame() {}
  /**
   * Internal method to add events
   * @param {String} method
   * @param {Function} handler
   */
  _rEv(method, handler) {
    if (!["onCreate", "onFrame"].includes(method)) {
      if (method == "onKeyPress")
        this.engine._registerEvent("keyboard.*", handler);
      if (method.includes("onMouse")) {
        var mouseEv = method.split("onMouse")[1].toLowerCase();
        if (["middle", "left", "right", "move"].includes(mouseEv))
          this.engine._registerEvent(`mouse.${mouseEv}`, handler);
      }
    }
  }
}
export class Sprite {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.gfx = game.gfx;
    this.engine = game.engine;
    this.obj = { x: 0, y: 0, z: 0 };
    this.velocity = [0, 0];
    var events = ["onMouseLeft", "onMouseMove", "onMouseRight", "onKeyPress"];
    classMethods(this).forEach((m) => game._rEv(m, this[m]));
    events.forEach((e) => {
      if (this[e]) game._rEv(e, this[e]);
    });
    var inRange = (x, y, width, height) => {
      var mouse = Object.values(
        this.engine.mouse[this.engine.mouse.length - 1]
      );
      return (
        x + width >= mouse[0] &&
        mouse[0] >= x &&
        y + height >= mouse[1] &&
        mouse[1] >= y
      );
    };
    if (this.onClick) {
      game._rEv("onMouseLeft", () => {
        if (inRange(this.obj.x, this.obj.y, ...this.texture.getShape()))
          this.onClick();
      });
      game._rEv("onMouseRight", () => {
        if (inRange(this.obj.x, this.obj.y, ...this.texture.getShape()))
          this.onClick();
      });
    }
    this.onCreate();
  }
  /**
   * Loads a texture
   * @param {String|Texture} texture Asset or Texture to load
   */
  loadTexture(texture) {
    if (typeof texture == "string")
      var ntexture = this.engine.convertAssetToTexture(texture);
    if (this.id)
      this.engine.changeObject(this.id, {
        pixels: Canvas.createImageData(
          this.texture._getData(),
          ...this.texture.getShape()
        ),
      });
    this.texture = ntexture;
  }
  /**
   * Renders the spriteto the screen
   */
  render() {
    this.obj.x += this.velocity[0];
    this.obj.y += this.velocity[1];
    if (this.onFrame && this.id) this.onFrame();
    if (!this.id) {
      this.id = this.gfx.draw(this.obj.x, this.obj.y, this.obj.z, this.texture);
    } else {
      this.engine.changeObject(this.id, this.obj);
    }
    this.obj = this.gfx.getObject(this.id);
  }
  /**
   * Changes the sprite
   * @param {Object} newObj
   */
  changeSprite(newObj) {
    Object.keys(newObj).forEach((k) => (this.obj[k] = newObj[k]));
  }
  /**
   * Moves a sprite to a x,y position
   * @param {Number} x
   * @param {Number} y
   */
  move(x, y) {
    this.changeSprite({ x: this.obj.x + x, y: this.obj.y + y });
  }
  /**
   * Rotates a sprite
   * @param {Number} degrees
   */
  rotate(degrees) {
    this.changeSprite({ rotation: degrees });
  }
  /**
   * Changes a sprite's velocity
   * @param {Number} x
   * @param {Number} y
   */
  changeVelocity(x, y) {
    this.velocity[0] += x;
    this.velocity[1] += y;
  }
  /**
   * Changes a sprites Z-axis
   * @param {Number} layer
   */
  changeLayer(layer) {
    this.obj.z = layer;
  }
  /**
   * Gets colliding objects
   * @returns {Array<Object>}
   */
  getCollisions() {
    return this.engine.getObjectCollisions(this.id);
  }
}
