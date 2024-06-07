import { GFX, PixelArray, Screen } from "./gfx.js";

var screen = new Screen([640, 360], [1, 1], "Game");
var square = new PixelArray(100, 100);
const gfx = new GFX(screen);
screen.registerEvent("mouse.*", () => {});
for (var i = 0; i < 100; i++) {
  for (var j = 0; j < 100; j++) square.set(i, j, [255, 255, 255, 255]);
}
gfx.fillScreen([0,0,255,255])
//gfx.draw(0, 0, 0, square);
gfx.draw(0, -40, -1, square,90);
