import { Texture, Engine } from "./main.js";
import path from "path";
import { cwd } from "node:process";
class Game {
  constructor(gfx, engine) {
    this.gfx = gfx;
    var square = new Texture(100, 100);
    square.fill([255, 255, 255, 90]);
    gfx.fillScreen([0, 0, 255, 255]);
    gfx.draw(0, 0, 0, square);
    this.drawnSquare = gfx.draw(50, 50, -1, square);
  }
  async onCreate(engine) {
    await engine.loadAsset(path.join(cwd(), "test.png"), "mario");
    var mario=engine.convertAssetToTexture("mario")
    this.gfx.draw(0, 0, 1, mario);
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
