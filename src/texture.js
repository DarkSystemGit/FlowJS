import { processArr } from "./utils.js";

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
