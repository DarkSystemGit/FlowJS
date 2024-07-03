import flow from "./src/main.js";
import path from "node:path";
import { cwd } from "node:process";
class Mario extends flow.Sprite {
  onCreate() {
    this.loadTexture("mario");
  }
  onFrame() {
    if (this.touchingRange(1280, 720)) {
      this.velocity = [0, 0];
    }
  }
  onKeyPress(key) {
    if (key[0] == "right" && !(this.position.x > 1280-this.width))
      this.changeVelocity(1, 0);
    if (key[0] == "left" && !(this.position.x < 0)) this.changeVelocity(-1, 0);
    if (key[0] == "up" && !(this.position.y < 0)) this.changeVelocity(0, -1);
    if (key[0] == "down" && !(this.position.y > 720-this.height)) this.changeVelocity(0, 1);
  }
}
class MyGame extends flow.Game {
  async onCreate() {
    await this.engine.loadAsset(path.join(cwd(), "test.png"), "mario");
    await this.engine.loadAsset(path.join(cwd(), "background.jpeg"), "marioBg");
    await this.engine.loadAsset(path.join(cwd(), "mario.wav"), "marioTrack");
    this.gfx.fillScreen([0, 0, 255, 255]);
    this.addSprite(Mario);
    var bg = this.gfx.getTexture("marioBg");
    bg.setDimensions(1280, 720);
    this.gfx.setLayerBackground(0, bg);
    //this.audio.play('marioTrack',200,true)
  }
}
new flow.Engine(MyGame, [1280, 720], "Game");
