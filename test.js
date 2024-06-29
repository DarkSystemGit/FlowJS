import flow from "./src/main.js";
import path from "node:path";
import { cwd } from "node:process";
class Mario extends flow.Sprite {
  onCreate() {
    this.loadTexture("mario");
  }
  onKeyPress(key) {
    if (key[0] == "right") this.changeVelocity(1, 0);
    if (key[0] == "left") this.changeVelocity(-1, 0);
    if (key[0] == "up") this.changeVelocity(0, -1);
    if (key[0] == "down") this.changeVelocity(0, 1);
  }
}
class MyGame extends flow.Game {
  async onCreate() {
    await this.engine.loadAsset(path.join(cwd(), "test.png"), "mario");
    await this.engine.loadAsset(path.join(cwd(), "background.jpeg"), "marioBg");
    this.gfx.fillScreen([0, 0, 255, 255]);
    this.addSprite(new Mario(this));
    var bg=this.gfx.getTexture("marioBg")
    bg.setDimensions(1280,720)
    this.gfx.setLayerBackground(0,bg)
  }
  
}
new flow.Engine(MyGame, [1280, 720], "Game");
