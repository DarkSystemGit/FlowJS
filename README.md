# FlowJS - A Node.JS Game Engine Library ✨

Supercharge your Node.JS game development with FlowJS! 🚀 This lightweight and efficient library provides all the essential building blocks for crafting awesome 2D games.  Think of it as your trusty sidekick, packed with features to handle rendering, input, sprites, and more! 

## Features that'll make you go 🤩

- **Asset Management:** Effortlessly load and manage textures, sounds, and other game assets.
- **Sprite Rendering:**  Render sprites with smooth animations, transformations, and even custom shaders for that extra sparkle! ✨
- **Input Handling:**  Let FlowJS handle keyboard and mouse input, so you can focus on the fun stuff. 🎮
- **Collision Detection:**  Add physics and interactions between objects with collision detection. 💥
- **Sprites:**  Extend the `Sprite` class to create unique sprites with their own behaviors and abilities. 💫

## Installation (It's a snap!)
Just simply run:
```bash
npm install flowjs
```

## How to Use It 

1. **Import FlowJS into your project:**

```js
import flow from 'flowjs';
```

2. **Create an Game instance:**

```js
class MyGame extends flow.Game {
  async onCreate() {
    //...creation code here...
  }
  
}
```

3. **Load your assets:**
 
 ```js
 await engine.loadAsset('./assets/player.png', 'player');
```

4. **Create your sprites:**

```js
class Player extends flow.Sprite {
  onCreate() {
    this.loadTexture("player");
  }
  onKeyPress(key) {
    if (key[0] == "right") this.changeVelocity(1, 0);
    if (key[0] == "left") this.changeVelocity(-1, 0);
    if (key[0] == "up") this.changeVelocity(0, -1);
    if (key[0] == "down") this.changeVelocity(0, 1);
  }
}
```
5. **Load your sprites**

```js
async onCreate() {
    //...other creation code here...
    this.addSprite(Player)
  }
  ```
6. **And start your game!**
```js
new flow.Engine({game:MyGame, window:{width:1280, height:720, title:"Game"}});
```
