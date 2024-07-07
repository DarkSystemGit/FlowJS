import Canvas from "canvas";
import classMethods from "class-methods";
import { err } from "./utils.js";
export class Sprite {
  /**
   * Constructs a new Sprite instance.
   * @param {Game} game - The game instance that the sprite belongs to.
   * @constructor
   */
  constructor(game) {
    /**
     * Constructs a new sprite object.
     * @param {Object} game - The game object that contains the necessary components for the sprite.
     * @param {Object} game.gfx - The graphics component.
     * @param {Object} game.engine - The engine component.
     * @param {Object} game.audio - The audio component.
     * @param {Object} game.camera - The camera component.
     * @property {Object} obj - The object representation of the sprite.
     * @property {number} obj.x - The x-coordinate of the sprite.
     * @property {number} obj.y - The y-coordinate of the sprite.
     * @property {number} obj.z - The z-coordinate of the sprite.
     * @property {Object} position - The position of the sprite.
     * @property {number} position.x - The x-coordinate of the sprite's position.
     * @property {number} position.y - The y-coordinate of the sprite's position.
     * @property {Array.<number>} velocity - The velocity of the sprite.
     * @property {number} width - The width of the sprite.
     * @property {number} height - The height of the sprite.
     * @property {Array.<string>} events - The events that the sprite can listen for.
     * @property {Function} onClick - The function to be called when the sprite is clicked.
     * @property {Function} onCreate - The function to be called when the sprite is created.
     * @property {Function} onFrame - The function to be called on each frame.
     */
    this.gfx = game.gfx;
    this.engine = game.engine;
    this.audio = game.audio;
    this.camera = game.camera;
    this.obj = { x: 0, y: 0, z: 0 };
    this.position = { x: 0, y: 0 };
    this.velocity = [0, 0];
    this.width = 0;
    this.height = 0;
    var events = ["onMouseLeft", "onMouseMove", "onMouseRight", "onKeyPress"];
    classMethods(this).forEach((m) =>
      game._rEv(m, (...args) => this[m](...args))
    );
    events.forEach((e) => {
      if (this[e]) game._rEv(e, (...args) => this[e](...args));
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
   * Checks if the sprite is in a range
   * @param {Number} width
   * @param {Number} height
   * @param {Number} minWidth
   * @param {Number} minHeight
   * @returns {Boolean}
   */
  inBounds(width, height, minWidth, minHeight) {
    try {
      return !(
        this.position.x > width - this.width ||
        this.position.x < (minWidth || 0) ||
        this.position.y > height - this.height ||
        this.position.y < (minHeight || 0)
      );
    } catch {
      err("Invalid Parameters");
    }
  }
  /**
   * Loads a texture
   * @param {String|Texture} texture Asset or Texture to load
   */
  loadTexture(texture) {
    try {
      if (typeof texture == "string")
        var ntexture = this.engine.convertAssetToTexture(texture);
      else var ntexture = texture;
      this.texture = ntexture;
      if (this.id)
        this.engine.changeObject(this.id, {
          pixels: Canvas.createImageData(
            this.texture._getData(),
            ...this.texture.getShape()
          ),
        });
      this.width = ntexture.getShape()[0];
      this.height = ntexture.getShape()[1];
    } catch {
      err(`Error: Invalid texture`);
    }
  }
  /**
   * Renders the sprite to the screen
   */
  render() {
    this.obj.x += this.velocity[0];
    this.obj.y += this.velocity[1];
    this.position = { x: this.obj.x, y: this.obj.y };
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
    try {
      Object.keys(newObj).forEach((k) => (this.obj[k] = newObj[k]));
    } catch {
      err("Error while changing sprite");
    }
  }
  /**
   * Moves a sprite to a x,y position
   * @param {Number} x
   * @param {Number} y
   */
  move(x, y) {
    try {
      this.changeSprite({ x: this.obj.x + x, y: this.obj.y + y });
    } catch {
      err("Error when moving sprite");
    }
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
    try {
      return this.engine.getObjectCollisions(this.id);
    } catch {
      err("Error when getting collisions");
    }
  }
}
