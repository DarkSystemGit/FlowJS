import { Engine,Game,Sprite } from "./main.js";
import path from "node:path";
import { cwd } from "node:process";
class Mario extends Sprite{
  async onCreate(){
    this.loadTexture('mario')
  }
  onFrame(){
    this.changeSprite(this.engine.getMousePos())
    this.rotate(1)
  }
  onClick(){
    console.log('click')
  }
}
class MyGame extends Game{
  async onCreate(engine) {
    await this.engine.loadAsset(path.join(cwd(), "src/test.png"), "mario");
    this.gfx.fillScreen([0, 0, 255, 255]);
    this.mario=new Mario(this)
  }
  onFrame(){
    this.mario.render()
  }
}
new Engine(MyGame, [1280, 720], [1, 1], "Game");
