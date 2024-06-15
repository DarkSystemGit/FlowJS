import { Texture, Engine,AssetManager } from "./gfx.js";
var start;
var frame = 0;
class Game {
  constructor(gfx) {
    this.gfx = gfx;
    var square = new Texture(100, 100);
    square.fill([255, 255, 255, 255]);
    gfx.fillScreen([0, 0, 255, 255]);
    gfx.draw(0, 0, 0, square);
    this.drawnSquare = gfx.draw(50, 50, -1, square);
  }
  onFrame(...args) {
    var obj = this.gfx.getObject(this.drawnSquare);
    this.gfx.moveObject(this.drawnSquare, { x: obj.x + 1, y: obj.y + 1 });
  }
}
new Engine(Game, [1280, 720], [1, 1], "Game");
