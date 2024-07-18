import { getFormat } from "@unpic/pixels";
import Canvas from "canvas";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { Worker } from "node:worker_threads";
import crypto from "crypto";
import path from "path";
export const clone = (obj) => JSON.parse(JSON.stringify(obj));
export function createImageBitmap(pix, w, h) {
  var tmpCanvas = Canvas.createCanvas(w, h);
  tmpCanvas.getContext("2d").putImageData(pix, 0, 0, 0, 0, w, h);
  return tmpCanvas;
}
export const genUUID = () => crypto.randomBytes(16).toString("hex");
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
export const getPixels = (file) => {
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
};
export const indexesOf = (arr, item) =>
  arr.reduce((acc, v, i) => (v === item && acc.push(i), acc), []);
export const err = (err) => {
  throw new Error(err);
};
export const brc = ({ numBands = 4, data, height, width }) => {
  if (
    typeof data === "object" &&
    data.constructor &&
    data.constructor.name === "ImageData" &&
    data.data
  ) {
    data = data.data;
    if (!height) height = data.height;
    if (!width) width = data.width;
  }

  const valuesPerRow = width * numBands;

  if (!height && numBands && width) height = data.length / numBands / width;
  if (!width && numBands && width) width = data.length / numBands / height;
  if (!numBands && height && width) numBands = data.length / height / width;

  const values = [];

  for (let bandIndex = 0; bandIndex < numBands; bandIndex++) {
    const band = [];
    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < width; colIndex++) {
        const i = rowIndex * valuesPerRow + colIndex * numBands + bandIndex;
        row.push(data[i]);
      }
      band.push(row);
    }
    values.push(band);
  }

  const result = { data: values };
  return result;
};
export class IPC {
  constructor(fpath) {
    this.messages = {};
    this.worker = new Worker(path.join(import.meta.dirname, "./" + fpath));
    this.worker.on("message", (m) => this.messages[m.id](m));
  }
  send(type, params) {
    return new Promise((resolve) => {
      var id = genUUID();
      this.messages[id] = (m) => resolve(m.res);
      this.worker.postMessage({ type, id, ...params });
    });
  }
}
