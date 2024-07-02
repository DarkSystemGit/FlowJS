import Canvas from "canvas";
import classMethods from "class-methods";
import util from "node:util";
import { GFX } from "./gfx.js";
import {
  createImageBitmap,
  colliding,
  angle,
  getPixels,
  err,
} from "./utils.js";
import npath from "path";
import brc from "fast-brc";
import { AudioManager } from "./audio.js";
import { readFile } from "node:fs/promises";
import { Texture } from "./texture.js";
import { Renderer } from "./renderer.js";

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
      const window = (this.window = new Renderer(
        title,
        dimensions,
        scale || [1, 1]
      ));
      this.events = { keyboard: {}, mouse: {} };
      this.canvas = Canvas.createCanvas(...dimensions);
      this.ctx = this.canvas.getContext("2d");
      this.scale = scale || [1, 1];
      this.dimensions = dimensions;
      this.uuid = 0;
      this.objects = new Map();
      this.mouse = [];
      this.mouseClicks = [];
      this.shaders = [];
      this.camera = [0, 0];
      this.keyboard = [[0, 0]];
      this.audio = new AudioManager();
      this.assets = new AssetManager(this.audio);
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
        this._handleEvents();
        this.onFrame(this);
        await this._drawObjects();
        var gameCanvas = this.ctx.getImageData(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        if (this.shaders.length > 0) {
          var data = new Uint8ClampedArray(gameCanvas.data.length);
          for (var i = 0; i < gameCanvas.data.length; i = i + 4) {
            var pix = gameCanvas.data.slice(i, i + 4);
            pix =
              this.shaders[0](
                (i / 4) % this.canvas.width,
                i / 4 / this.canvas.width,
                pix
              ) || pix;
            data.set(pix, i);
          }
          gameCanvas = Canvas.createImageData(data, this.canvas.width);
        }

        window.render(gameCanvas);
        setImmediate(gameLoop);
      };
      setImmediate(gameLoop);
      return this;
    })();
  }
  /**
   * Loads an asset
   * @param {String} path Path to file
   * @param {String} name Name of asset
   */
  async loadAsset(path, name) {
    if ([".wav", ".mp3", ".ogg"].includes(npath.extname(path)))
      return await this.assets.loadAudio(path, name);
    if ([".png", ".jpeg"].includes(npath.extname(path)))
      return await this.assets.loadTexture(path, name);
    err("Invalid asset type, " + npath.extname(path).replace(".", ""));
  }
  /** Lists loaded assets
   * @returns {Array<String>}
   */
  listAssets() {
    return this.assets.listAssets();
  }
  /**
   * Sets the game shader
   * @param {Function} shader
   */
  setShaderFunc(shader) {
    this.shaders[0] = shader;
  }
  /**
   * Removes an asset from storage
   * @param {String} name Name of asset
   */
  removeAsset(name) {
    this.assets.removeAsset(name);
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
          tmpCtx.putImageData(
            item.pixels,
            0,
            0,
            0,
            0,
            item.shape[0],
            item.shape[1]
          );
          this.ctx.drawImage(tmpCanvas, -item.shape[0] / 2, -item.shape[1] / 2);
          this.ctx.restore();
        } else {
          if (item.special && item.special[0] == "fs") {
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = `rgba(${item.special[1].join(",")})`;
            this.ctx.fill();
          } else if (item.special && item.special[0] == "tex") {
            var tmpCanvas = Canvas.createCanvas(
              item.special[1],
              item.special[2]
            );
            var tmpCtx = tmpCanvas.getContext("2d");
            tmpCtx.putImageData(
              item.pixels,
              0,
              0,
              0,
              0,
              item.special[1],
              item.special[2]
            );
            this.ctx.drawImage(
              tmpCanvas,
              item.x + -1 * this.camera[0],
              item.y + -1 * this.camera[1]
            );
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
    this.mouse.push(this.window.getMousePos());
    if (this.window.mousePressed()) this.mouseClicks.push(Date.now());
    if (!(this.window.getPressedKeys().length == 0))
      this.keyboard.push([this.window.getPressedKeys(), Date.now()]);

    if (
      this.keyboard.length > 1 &&
      this.keyboard[this.keyboard.length - 1][1] -
        this.keyboard[this.keyboard.length - 2][1] >
        20
    ) {
      Object.keys(events.keyboard).forEach((key) => {
        if (
          this.window.keyPressed(key) ||
          (key == "*" && this.window.getPressedKeys().length > 0)
        ) {
          events.keyboard[key].forEach((f) => {
            if (key == "*") key = this.window.getPressedKeys();
            f(key, this);
          });
        }
      });
    }
    Object.keys(events.mouse).forEach((ev) => {
      if (
        (["left", "right", "middle"].includes(ev) &&
          this.window.mouseButtonPressed(ev)) ||
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
  constructor(aud) {
    this.assets = {};
    this.audio = aud;
  }
  /**
   * Loads a audio stream
   * @param {String} file File Path
   * @param {String} name Asset Name
   * @returns {Object} Asset
   */
  async loadAudio(file, name) {
    return await this.audio._loadAudio(file, name);
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
    f.type = "texture";
    this.assets[name] = f;
    return this.assets[name];
  }
  /**
   * Deletes a texture from storage
   * @param {String} name Asset Name
   */
  removeAsset(name) {
    if (this.assets[name]) delete this.assets[name];
  }
  /**
   * Gets a texture
   * @param {String} name Asset Name
   * @returns
   */
  getTexture(name) {
    if (!this.assets[name]) err(`No such texture, ${name}`);
    if (this.assets[name].type != "texture")
      throw new Error(`The asset ${name} is not a texture.`);
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
  listAssets() {
    return Object.keys(this.assets);
  }
}
