import Canvas from "canvas";
import { PixelArray } from "./texture.js";

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
   * Sets layer background
   * @param {Texture|String} texture
   */
  setLayerBackground(layer, texture) {
    if (typeof texture == "string")
      texture = this.engine.convertAssetToTexture(texture);
    this.engine.objects.set(layer, this.engine.objects.get(layer) || []);
    this.engine.objects
      .get(layer)
      .unshift({
        pixels: Canvas.createImageData(
          texture._getData(),
          ...texture.getShape()
        ),
        x: 0,
        y: 0,
        z: layer,
        shape: texture.getShape(),
        rotation: 0,
        special: undefined,
      });
  }
  /**
   * Update engine instance
   * @param {Engine} engine Engine object
   */
  updateEngine(engine) {
    this.engine = engine;
  }
}
