import { Engine } from "./main.js";
import path from "node:path";
import { cwd } from "node:process";
class MyGame {
  constructor(gfx, engine) {
    this.gfx = gfx;
    gfx.fillScreen([0, 0, 255, 255]);
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
new Engine(MyGame, [1280, 720], [1, 1], "Game");
