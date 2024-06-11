import { Texture, Engine } from "./gfx.js";
var start;
var frame=0;
class Game {
  constructor(gfx) {
    start=Date.now()
    this.gfx = gfx;
    var square = new Texture(100, 100);
    square.fill([255, 255, 255, 255]);
    gfx.fillScreen([0, 0, 255, 255]);
    gfx.draw(0, 0, 0, square);
    this.drawnSquare = gfx.draw(50, 50, -1, square);
  }
  onFrame(...args) {
    frame++
    console.log('FPS:',frame/((Date.now()-start)))
    
    this.gfx.rotateObject(this.drawnSquare,10)
  }
}
var screen = new Engine(Game, [1280, 720], [1, 1], "Game");


