import { registerFont} from "canvas";
import { err } from "./utils.js";
export class TextManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.textBlocks = [];
    this.fonts = new Map();
  }

  loadFont(name, path) {
    try {
      registerFont(path, { family: name });
      this.fonts.set(name, true);
    } catch (error) {
      err(`Failed to load font ${name}: ${error.message}`);
    }
  }


  drawText(block) {
    try {
        var ctx=this.ctx
        ctx.save();
        ctx.font = block.font;
        ctx.fillStyle = block.color;

        const words = block.text.split(" ");
        let line = "";
        let y = block.y;

        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > block.width && line !== "") {
            ctx.fillText(line, block.x, y);
            line = word + " ";
            y += parseInt(block.font) * 1.2; // Line height
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, block.x, y);

        ctx.restore();
      
    } catch {
      err("Internal Error while drawing text");
    }
  }
}
export class Text {
  constructor(
    text='',
    ui=false,
    width=0,
    height=0,
    color = [0, 0, 0, 255],
    font = "Arial",
    size = 12
  ) {
    this.text = text;
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.color = `rgb(${color.join(",")})`;
    this.font = `${size}px ${font}`;
    this.ui = ui;
  }
  setText(text) {
    this.text = text;
  }
  setDimensions(width, height) {
    this.width = width || this.width;
    this.height = height || this.height;
  }
  setColor(color) {
    this.color = `rgb(${color.join(",")})`;
  }
  setFont(font, size) {
    this.font = `${size}px ${font}`;
  }
}

