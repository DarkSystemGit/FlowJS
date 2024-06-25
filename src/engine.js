import sdl from "@kmamal/sdl";
import Canvas from "canvas";
import classMethods from "class-methods";
import util from "node:util";
import { GFX } from "./gfx.js";
import { indexesOf, createImageBitmap, colliding, angle, getPixels,mousePressed } from "./utils.js";
import brc from "fast-brc";
import { readFile } from "node:fs/promises";
import { Texture } from "./texture.js";

export class Engine {
  /**
   * Game Engine
   * @param {Class} handlerClass Game class
   * @param {Array<number>} dimensions Screen dimensions
   * @param {Number} scale Scale factor
   * @param {String} title Window Title
   * @returns
   */
  constructor(handlerClass, dimensions, title, scale) {
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
      this.scale = scale || [1, 1];
      this.screenCanvas = Canvas.createCanvas(
        dimensions[0] * this.scale[0],
        dimensions[1] * this.scale[1]
      );
      this.screenCtx = this.screenCanvas.getContext("2d");
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
      this.onFrame = (a) => handler._onFrame(a) || function () {};
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
export class AssetManager {
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

