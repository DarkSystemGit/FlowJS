import { Texture, Engine } from "./gfx.js";
import path from "path";
import { cwd } from "node:process";
var start;
var frame = 0;
class Game {
  constructor(gfx, engine) {
    this.gfx = gfx;

    var square = new Texture(100, 100);
    square.fill([255, 255, 255, 255]);
    gfx.fillScreen([0, 0, 255, 255]);
    gfx.draw(0, 0, 0, square);
    this.drawnSquare = gfx.draw(50, 50, -1, square);
  }
  async onCreate(engine) {
    await engine.loadAsset(path.join(cwd(), "test.png"), "mario");
    this.gfx.draw(0, 0, 1, engine.convertAssetToTexture("mario"));
  }
  onFrame(engine) {
    var obj = this.gfx.getObject(this.drawnSquare);
    this.gfx.moveObject(this.drawnSquare, {
      x: obj.x + (obj.x % 3),
      y: obj.y + (obj.y % 3),
    });
  }
}
new Engine(Game, [1280, 720], [1, 1], "Game");
