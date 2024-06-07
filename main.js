import sdl from "@kmamal/sdl";
import Canvas from "canvas";
import ndarray from "ndarray";
const window = sdl.video.createWindow({ resizable: true });

let canvas;
let ctx;
var arr = new PixelArray(100, 100);
for (var i = 0; i < 100; i++) {
  for (var j = 0; j < 100; j++) arr.set(i, j, [255, 255, 255, 255]);
}
const redraw = () => {
  const { pixelWidth: width, pixelHeight: height } = window;

  //console.log(arr.getData())
  drawArray(arr, 50, 50);
  const buffer = canvas.toBuffer("raw");
  window.render(width, height, width * 4, "bgra32", buffer);
};

window.on("expose", redraw);

window.on("resize", ({ pixelWidth: width, pixelHeight: height }) => {
  canvas = Canvas.createCanvas(width, height);
  ctx = canvas.getContext("2d");
  redraw();
});
