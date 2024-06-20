import { Texture, Engine } from "./main.js";
import path from "node:path";
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
    await engine.loadAsset(path.join(cwd(), "src/test.png"), "mario");
    this.mario=this.gfx.draw(0, 0, 1, engine.convertAssetToTexture("mario"));
  }
  onFrame() {
    var obj = this.gfx.getObject(this.mario);
    this.gfx.moveObject(this.mario, {
      x: obj.x +.5,
      y: obj.y +.5,
    });
  }
  onMouseLeft(){
    console.log('mouseLeft',Date.now())
  }
  onMouseRight(){
    console.log('mouseRight',Date.now())
  }
}
new Engine(Game, [1280, 720], [1, 1], "Game");
