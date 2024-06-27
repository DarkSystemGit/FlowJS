import { getFormat } from "@unpic/pixels";
import sdl from "@kmamal/sdl";
import Canvas from "canvas";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

export function createImageBitmap(pix, w, h) {
  var tmpCanvas = Canvas.createCanvas(w, h);
  tmpCanvas.getContext("2d").putImageData(pix, 0, 0,0,0,w,h);
  return tmpCanvas;
}
export const angle = (anchor, point) =>
  (Math.atan2(anchor[1] - point[1], anchor[0] - point[0]) * 180) / Math.PI +
  180;
export const colliding = (obj1, obj2) =>
  obj1.x < obj2.x + obj2.width &&
  obj1.x + obj1.width > obj2.x &&
  obj1.y < obj2.y + obj2.height &&
  obj1.y + obj1.height > obj2.y;
export const processArr = (array) => {
  return array.flat(1);
};
export const getPixels = async (file) => {
  var format = getFormat(file);
  if (format == "png") {
    var pix = PNG.sync.read(file);
  } else if (format == "jpg") {
    var pix = jpeg.decode(file);
  }
  return {
    shape: [pix.width, pix.height],
    data: Uint8ClampedArray.from(pix.data),
  };
};export const mousePressed = () => {
  for (var i = 0; i < 2; i++) {
    if (sdl.mouse.getButton(
      [
        sdl.mouse.BUTTON.LEFT,
        sdl.mouse.BUTTON.RIGHT,
        sdl.mouse.BUTTON.MIDDLE,
      ][i]
    ))
      return true;
  }
};
export const indexesOf = (arr, item) => arr.reduce((acc, v, i) => (v === item && acc.push(i), acc), []);

