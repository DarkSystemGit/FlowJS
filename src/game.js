/**
 * Game interface to be implemented by user
 * @member {GFX} gfx
 * @property {Engine} engine
 */
export class Game {
  /**
   * @param {GFX} gfx
   * @param {Engine} engine
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
    if (this.shader) this.engine.setShaderFunc(this.shader);
  }
  /**
   * Called on each frame
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
