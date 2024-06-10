import { GFX, Texture, Screen } from "./gfx.js";

var screen = new Screen([1280, 720], [1, 1], "Game");
var square = new Texture(100, 100);
const gfx = new GFX(screen);
//screen.registerEvent("mouse.move", (m) => {console.log(m)});
square.fill([255, 255, 255, 255]);
gfx.fillScreen([0, 0, 255, 255]);
gfx.draw(0, 0, 0, square);
var drawnSquare=gfx.draw(50, 50, -1, square);
//gfx.moveObject(drawnSquare,{y:100,x:100})
gfx.rotateObject(drawnSquare,270)
