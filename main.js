import { GFX, PixelArray, Screen } from "./gfx.js";

var screen = new Screen([1280, 720], [1, 1], "Game");
var square = new PixelArray(100, 100);
const gfx = new GFX(screen);
screen.registerEvent("mouse.*", () => {});
square.fill([255, 255, 255, 255]);
gfx.fillScreen([0, 0, 255, 255]);
//gfx.draw(0, 0, 0, square);
console.log(gfx.draw(50, 50, -1, square, 90));
