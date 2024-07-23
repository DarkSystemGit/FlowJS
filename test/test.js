import flow from "../src/main.js";
import path from "node:path";
class Mario extends flow.Sprite {
  onCreate() {
    var mario = this.gfx.getTexture("mario");
    this.map = this.gfx.getMap("marioMap");
    mario.setDimensions(32, 52);
    this.loadTexture(mario);
    //this.setPosition(0, 464 - this.height);
    this.setPosition(5*16+2, 719 - this.height);
  }
  onFrame() {
    try {
      var bottom =
        this.map.getTile(
          1,
          Math.ceil(this.position.x / 16),
          Math.ceil(this.position.y / 16 + 2)
        ) == 635;
      var top =
        this.map.getTile(
          1,
          Math.ceil(this.position.x / 16),
          Math.ceil(this.position.y / 16 - 2)
        ) == 635;
      var right =
        this.map.getTile(
          1,
          Math.ceil(this.position.x / 16 + 1),
          Math.ceil(this.position.y / 16)
        ) == 635 ||
        this.map.getTile(
          1,
          Math.ceil(this.position.x / 16 + 1),
          Math.ceil(this.position.y / 16 - 1)
        ) == 635;
      var left =
        this.map.getTile(
          1,
          Math.ceil(this.position.x / 16 - 1),
          Math.ceil(this.position.y / 16)
        ) == 635 ||
        this.map.getTile(
          1,
          Math.ceil(this.position.x / 16 - 1),
          Math.ceil(this.position.y / 16 - 1)
        ) == 635;
      //console.log(top,bottom,left,right)

      if (left || right) this.velocity[0] = 0;
      if (bottom) {
        this.velocity[1] = 0;
        this.jumping = false;
      }
      if (top) {
        this.velocity[1] = 0;
      }
      if (this.velocity[0] < 0 && !right) {
        this.changeVelocity(0.005, 0);
      }
      if (this.velocity[0] > 0 && !left) {
        this.changeVelocity(-0.005, 0);
      }
      if (left) {
        this.move(0.01, 0);
      }
      if (right) {
        this.move(-0.01, 0);
      }
      if (!bottom) this.changeVelocity(0, 0.01);
    } catch {
      
      this.gfx.fillLayer(Infinity,[0, 0, 0, 255]);
      this.gfx.draw(1280/2-250/2, 720/2, Infinity,new flow.Text("Game Over",true,1000,100,[255,255,255,255],"Arial",50));
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
    await this.engine.loadAsset(dir("level.png"), "marioBg");
    await this.engine.loadAsset(dir("mario.wav"), "marioTrack");
    await this.engine.loadAsset(dir("shader.glsl"), "shader");
    await this.engine.loadAsset(dir("map.json"), "marioMap");
    this.gfx.draw(0, 0, 0, this.gfx.getMap("marioMap"));
    //this.engine.setShader('shader')
    //this.gfx.fillScreen([0, 0, 255, 255]);
    this.addSprite(Mario);
    //var bg = this.gfx.getTexture("marioBg");
    //this.gfx.setLayerBackground(0, bg);
    this.audio.play("marioTrack", 200, true);
  }
}
new flow.Engine({
  game: MyGame,
  window: { width: 1280, height: 720, title: "Game" },
});
