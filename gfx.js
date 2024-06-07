const scale = (array, factor) => {
  const scaled = [];

  for (const row of array) {
    let x = [];

    for (const item of row) x.push.apply(x, Array(factor).fill(item));

    scaled.push.apply(scaled, Array(factor).fill(x));
  }

  return scaled;
};
export class GFX {
  constructor(ctx, screenSize) {
    this.ctx = ctx;
    this.screen = screenSize;
    this.dimensions = [ctx.canvas.width, ctx.canvas.height];
    this.scale = this.dimensions.map((val, i) => val / screenSize[i]);
  }
  draw(x, y, pixels) {
    this.ctx.putImageData(
      Canvas.createImageData(pixels.getData(), ...pixels.getShape()),
      x,
      y
    );
  }
  fillScreen(color) {
    color = color || [0, 0, 0, 255];
    this.ctx.fillStyle = `rgba(${color.join()})`;
    this.ctx.fillRect(0, 0, ...this.dimensions);
  }
  updateCtx(ctx) {
    this.ctx = ctx;
  }
}
class PixelArray {
  constructor(w, h) {
    this.obj = { data: [], shape: [w, h, 4] };
  }
  set(x, y, value) {
    this.obj.data[x * this.obj.shape[0] + y] = value;
  }
  getData(scale) {
    scale = scale || 1;
    var r = new Uint8ClampedArray(
      this.obj.shape[0] * this.obj.shape[1] * 4 * scale
    );
    r.set(this.obj.data.flat(1), 0);
    return r;
  }
  getShape() {
    return this.obj.shape;
  }
}
