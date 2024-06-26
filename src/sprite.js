import Canvas from "canvas";
import classMethods from "class-methods";

export class Sprite {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.gfx = game.gfx;
    this.engine = game.engine;
    this.camera=game.camera
    this.obj = { x: 0, y: 0, z: 0 };
    this.velocity = [0, 0];
    var events = ["onMouseLeft", "onMouseMove", "onMouseRight", "onKeyPress"];
    classMethods(this).forEach((m) => game._rEv(m, (...args)=>this[m](...args)));
    events.forEach((e) => {
      if (this[e]) game._rEv(e, (...args)=>this[e](...args));
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
