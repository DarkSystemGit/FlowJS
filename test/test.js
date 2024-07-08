import flow from "../src/main.js";
import path from "node:path";
class Mario extends flow.Sprite {
  onCreate() {
    var mario = this.gfx.getTexture("mario");
    mario.setDimensions(48, 78);
    this.loadTexture(mario);
    this.setPosition(0, 640-this.height);
  }
  onFrame() {
    if (
      (!this.inBounds(1280, 640) && !(this.position.y < 0)) ||
      this.getCollisions().length != 0
    ) {
      if (!this.inBoundsX(1280)) this.velocity[0] = 0;
      if (!this.inBoundsY(640)) {
        this.velocity[1] = 0;
        this.jumping = false;
      }
      if(this.velocity[0] < 0) {
        this.changeVelocity(0.005,0);
      }
      if(this.velocity[0] > 0) {
        this.changeVelocity(-0.005,0);
      }
    } else {
      this.changeVelocity(0, 0.01);
    }
  }
  onKeyPress(key) {
    if (key[0] == "right" && !(this.position.x > 1280 - this.width))
      this.changeVelocity(0.01, 0);
    if (key[0] == "left" && !(this.position.x < 0))
      this.changeVelocity(-0.01, 0);
    if (key[0] == "up" && !(this.position.y < 0) && !this.jumping) {
      this.changeVelocity(0, -1);
      this.jumping = true;
    }
  }
}
class MyGame extends flow.Game {
  async onCreate() {
    var dir = (f) => path.join(path.dirname(import.meta.dirname), "test", f);
    await this.engine.loadAsset(dir("test.png"), "mario");
    await this.engine.loadAsset(dir("background.jpeg"), "marioBg");
    await this.engine.loadAsset(dir("mario.wav"), "marioTrack");
    await this.engine.loadAsset(dir("shader.glsl"), "shader");
    //this.engine.setShader('shader')
    this.gfx.fillScreen([0, 0, 255, 255]);
    this.addSprite(Mario);
    var bg = this.gfx.getTexture("marioBg");
    bg.setDimensions(1280, 720);
    this.gfx.setLayerBackground(0, bg);
    this.audio.play('marioTrack',200,true)
  }
}
new flow.Engine({
  game: MyGame,
  window: { width: 1280, height: 720, title: "Game" },
});
