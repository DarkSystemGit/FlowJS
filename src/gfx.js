import Canvas from "canvas";
import { PixelArray,Texture } from "./texture.js";
import { err } from "./utils.js";
import { Map } from "./tiled.js";
import { Text } from "./text.js";
export class GFX {
  /**
   * Drawing interface
   * @param {Engine} engine Engine object
   */
  constructor(engine) {
    this.ctx = engine.ctx;
    this.engine = engine;
  }
  /**
   * Draw a object to the screen
   * @param {Number} x X cord
   * @param {Number} y Y cord
   * @param {Number} z Z cord
   * @param {PixelArray|Texture|Map|Text} pixels PixelArray, Texture, Text or Map to draw
   * @returns {Number}
   */
  draw(x, y, z, pixels) {
    if(pixels instanceof Map)return this.engine.drawMap(pixels,x,y,z)
    if(pixels instanceof Text)return this.engine.drawText(pixels,x,y,z)
    return this.engine.draw(
      Canvas.createImageData(pixels._getData(), ...pixels.getShape()),
      x,
      y,
      z,
      pixels.getShape(),
      pixels.getAngle(),
      undefined,
      pixels.special
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
    try {
      this.engine.changeObject(id, newPosition);
    } catch {
      err(`Error while moving object`);
    }
  }
  /**
   * Gets an objects data
   * @param {number} id Object ID
   * @returns {object}
   */
  getObject(id) {
    try {
      var obj = this.engine._getObject(id);
      return {
        x: obj.x,
        y: obj.y,
        z: obj.z,
        angle: obj.rotation,
        special: obj.special,
      };
    } catch {
      err(`Error while getting object`);
    }
  }
  /**
   * Changes an object's texture
   * @param {number} id Object ID
   * @param {Texture|PixelArray} texture New Texture
   */
  changeObjectTexture(id, texture) {
    try {
      this.engine.changeObject(id, {
        pixels: Canvas.createImageData(
          texture._getData(),
          ...texture.getShape()
        ),
      });
    } catch {
      err(`Error while changing object texture`);
    }
  }
  /**
   * Rotates a object
   * @param {number} id Object ID
   * @param {number} degrees Rotation Angle
   */
  rotateObject(id, degrees) {
    try {
      this.engine.changeObject(id, { rotation: degrees });
    } catch {
      err(`Error while rotating object texture`);
    }
  }
  /**
   * Fills a layer with a color
   * @param {Array<number>} color RGBA color
   */
  fillLayer(layer,color) {
    try {
      //this.engine._clear();
      var fill = new PixelArray(
        this.engine.canvas.width,
        this.engine.canvas.height
      );
      fill.fill(color || [0, 0, 0, 255]);
      this.draw(0, 0, layer, fill, ["fs", color]);
    } catch {
      err(`Error while filling screen`);
    }
  }
  /** Gets an asset's texture
   * @param {String} texture
   * @returns {Texture} Asset texture
   */
  getTexture(texture) {
    try {
      return this.engine.convertAssetToTexture(texture);
    } catch {
      err(`Error while getting texture`);
    }
  }
  /**
   * Gets a map
   * @param {String} name Map name
   * @returns {Map} Map
   */
  getMap(name) {
    return this.engine.getMap(name);
  }
  /**
   * Sets layer background
   * @param {Texture|String} texture
   */
  setLayerBackground(layer, texture) {
    try {
      if (typeof texture == "string")
        texture = this.engine.convertAssetToTexture(texture);
      this.engine.objects.set(layer, this.engine.objects.get(layer) || []);
      this.engine.objects.get(layer).unshift({
        pixels: Canvas.createImageData(
          texture._getData(),
          ...texture.getShape()
        ),
        x: 0,
        y: 0,
        z: layer,
        shape: texture.getShape(),
        rotation: 0,
        id:this.engine.uuid,
        special: texture.special,
      });
      this.engine.uuid++;
    } catch {
      err(`Error while setting layer background`);
    }
  }
  /**
   * Update engine instance
   * @param {Engine} engine Engine object
   */
  updateEngine(engine) {
    this.engine = engine;
  }
}
