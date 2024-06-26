import flow from './src/main.js'
import path from "node:path";
import { cwd } from "node:process";
class Mario extends flow.Sprite {
  async onCreate() {
    this.loadTexture("mario");
  }
  onFrame() {
    this.camera.move(1, 1);
    this.changeSprite(this.engine.getMousePos());
  }
}
class MyGame extends flow.Game {
  async onCreate() {
    await this.engine.loadAsset(path.join(cwd(), "src/test.png"), "mario");
    this.gfx.fillScreen([0, 0, 255, 255]);
    this.addSprite(new Mario(this));
  }
}
new flow.Engine(MyGame, [1280, 720], "Game");
