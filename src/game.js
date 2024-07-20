import { GFX } from "./gfx.js";
import { Engine } from "./engine.js";
import { Sprite } from "./sprite.js";
import { AudioManager } from "./audio.js";
/**
 * Game interface to be implemented by user
 * @member {GFX} gfx
 * @property {Engine} engine
 */
export class Game {
  /**
   * Constructs a new Game instance with the provided GFX and Engine.
   * @param {GFX} gfx - The GFX instance used for rendering.
   * @param {Engine} engine - The Engine instance used for game logic.
   * @property {GFX} gfx - The GFX instance used for rendering.
   * @property {Engine} engine - The Engine instance used for game logic.
   * @property {AudioManager} audio - The Audio instance from the Engine.
   * @property {Object} camera - An object with methods to control the camera.
   * @property {Function} camera.setPosition - Sets the camera position.
   * @property {Function} camera.getPosition - Gets the current camera position.
   * @property {Function} camera.move - Moves the camera by the specified x and y values.
   * @property {Sprite[]} sprites - An array of Sprite instances to be rendered.
   */
  constructor(gfx, engine) {
    this.gfx = gfx;
    this.engine = engine;
    this.audio = engine.audio;
    this.camera = {
      setPosition: (x, y) => this.engine.setCameraPosition(),
      getPosition: () => this.engine.getCameraPosition(),
      move: (x, y) => this.engine.moveCamera(x, y),
    };
    this.sprites = [];
  }
  /**
   * Called on creation, implimented by subclass
   */
  async onCreate() {}
  /**
   * Called on each frame, implimented by subclass
   */
  onFrame() {}
  /**
   * Called on key press, implemented by subclass
   * @param {String[]} key Currently pressed keys
   */
  onKeyPress() {}
  /**
   * Called on mouse left press, implemented by subclass
   */
  onMouseLeft() {}
  /**
   * Called on mouse right press, implemented by subclass
   */
  onMouseRight() {}
  /**
   * Called on mouse middle down, implemented by subclass
   */
  onMouseMiddle() {}
  /**
   * Called on mouse move, implemented by subclass
   */
  onMouseMove() {}
  /**
   * Internal, called on each frame
   */
  _onFrame() {
    this.sprites.forEach((s) => (s ? s.render() : undefined));
    (this.onFrame || (() => {}))();
  }
  /** Adds a Sprite to be drawn
   * @param {Sprite} sprite
   * @returns {Number} Sprite id
   */
  addSprite(sprite) {
    try {
      this.sprites.push(new sprite(this));
      return this.sprites.length - 1;
    } catch {
      err(`Error while adding sprite`);
    }
  }
  /**
   * Removes a sprite
   * @param {Number} id
   */
  removeSprite(id) {
    delete this.sprites[id];
  }
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
