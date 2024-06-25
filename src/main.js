import { Engine } from "./engine.js";
import { Sprite } from "./sprite.js";
import { Texture } from "./texture.js";
/**
 * Game interface to be implemented by user
 * @member {GFX} gfx
 * @property {Engine} engine
 */
class Game {
  /**
   * @param {GFX} gfx 
   * @param {Engine} engine 
   */
  constructor(gfx, engine) {
    this.gfx = gfx;
    this.engine = engine;
    this.camera={setPosition:this.engine.setCameraPosition,getPosition:this.engine.setCameraPosition,move:this.engine.moveCamera}
    this.sprites=[]
  }
  /**
   * Called on each frame
   */
  _onFrame() {
    (this.onFrame||(()=>{}))()
  }
  /** Adds a Sprite 
   * @param {Sprite} sprite 
  */
  addSprite(sprite){
    this.sprites.push(sprite)
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
export default {Game,Engine,Sprite,Texture}