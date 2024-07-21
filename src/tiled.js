import { XMLParser } from "fast-xml-parser";
import path from "path";
import fs from "fs";
import Canvas from "canvas";
import { getPixels, err, createImageBitmap } from "./utils.js";
function parse(mapPath) {
  var map = JSON.parse(fs.readFileSync(mapPath));
  if (map.infinite) return err("Infinite maps are not supported");
  var tilesets = map.tilesets
    .map((tileset) => {
      return new XMLParser({
        attributeNamePrefix: "@_",
        ignoreAttributes: false,
      }).parse(
        fs
          .readFileSync(path.join(path.dirname(mapPath), tileset.source))
          .toString()
      );
    })
    .map(
      (t) =>
        new (class Tileset {
          constructor(t) {
            var c = Canvas.createCanvas(
              parseInt(t.tileset.image["@_width"]),
              parseInt(t.tileset.image["@_height"])
            );
            this.image = c.getContext("2d");
            this.cols = parseInt(t.tileset["@_columns"]);
            this.spacing = parseInt(t.tileset["@_spacing"]) || 0;
            this.dims = [
              parseInt(t.tileset.image["@_width"]),
              parseInt(t.tileset.image["@_height"]),
            ];
            this.tDims = [
              parseFloat(t.tileset["@_tilewidth"]),
              parseFloat(t.tileset["@_tileheight"]),
            ];
            this.tileDims = [
              parseFloat(t.tileset["@_tilewidth"]) +
                (parseFloat(t.tileset["@_spacing"]) || 0),
              parseFloat(t.tileset["@_tileheight"]) +
                (parseFloat(t.tileset["@_spacing"]) || 0),
            ];
            var tileset = getPixels(
              fs.readFileSync(
                path.join(path.dirname(mapPath), t.tileset.image["@_source"])
              )
            );
            this.image.putImageData(
              Canvas.createImageData(tileset.data, ...tileset.shape),
              0,
              0
            );
          }
          getTile(id) {
            //Cusred tiled stuff
            var pos = [
              (id % this.cols) * this.tileDims[0],
              Math.floor(id / this.cols) * this.tileDims[1],
            ];
            return this.image.getImageData(
              ...pos,
              this.tileDims[0] - this.spacing,
              this.tileDims[1] - this.spacing
            );
          }
          getTiles() {
            return (
              Math.floor(this.dims[0] / this.tileDims[0]) *
                Math.floor(this.dims[1] / this.tileDims[1]) -
              1
            );
          }
        })(t)
    );
  const getTile = (id) => {
    var previd = 0;
    try {
      id = id & 0x0fffffff;
      return tilesets
        .find((t) => {
          if (t.getTiles() + previd > id && id > previd) return t;
          previd = t.getTiles() + previd;
        })
        .getTile(id - previd - 1);
    } catch {
      return Canvas.createImageData(map.tilewidth, map.tileheight);
    }
  };
  var layers = map.layers.map(
    (l) =>
      new (class Layer {
        constructor(layer) {
          this.layer = layer.data.map((id) => [getTile(id), id]);
          this.type = layer.type;
          this.vis = layer.visible;
        }
        draw() {
          var tCtx = Canvas.createCanvas(
            map.width * map.tilewidth,
            map.height * map.tileheight
          ).getContext("2d");
          if (this.type == "tilelayer" && this.vis)
            switch (map.renderorder) {
              default:
                err("Invalid renderorder");
              case "right-down":
                for (var i = 0; i < this.layer.length; i++)
                  this.drawTile(i, this.layer, tCtx);
              case "left-up":
                for (var i = this.layer.length - 1; i >= 0; i--)
                  this.drawTile(i, this.layer, tCtx);
            }
          return tCtx;
        }
        drawTile(i, arr, ctx) {
          var t = false;
          ctx.save();
          if (0x80000000 & arr[i][1]) {
            if (!t)
              ctx.translate(
                ...[i % map.width, Math.floor(i / map.width)].map(
                  (e) => e * map.tilewidth
                )
              );
            t = true;
            ctx.translate(map.tilewidth, 0);
            ctx.scale(-1, 1);
          }
          if (0x40000000 & arr[i][1]) {
            if (!t)
              ctx.translate(
                ...[i % map.width, Math.floor(i / map.width)].map(
                  (e) => e * map.tilewidth
                )
              );
            t = true;
            ctx.translate(0, map.tileheight);
            ctx.scale(1, -1);
          }
          if (0x20000000 & arr[i][1]) {
            if (!t)
              ctx.translate(
                ...[i % map.width, Math.floor(i / map.width)].map(
                  (e) => e * map.tilewidth
                )
              );
            t = true;
            ctx.rotate(Math.PI / 2);
            ctx.scale(1, -1);
          }
          if (t)
            ctx.translate(
              ...[i % map.width, Math.floor(i / map.width)].map(
                (e) => e * map.tilewidth * -1
              )
            );

          ctx.drawImage(
            createImageBitmap(arr[i][0], arr[i][0].width, arr[i][0].height),
            ...[i % map.width, Math.floor(i / map.width)].map(
              (e) => e * map.tilewidth
            )
          );
          ctx.restore();
        }
      })(l)
  );
  return {
    tilesets,
    layers,
    getTile,
    width: map.width * map.tilewidth,
    height: map.height * map.tileheight,
    tilewidth:map.tilewidth
  };
}
export class Map {
  /**
   * Loads a tiled map.
   * @param {string} file - The path to the tiled map file.
   */
  constructor(file) {
    this.map = parse(file);
    this.width = this.map.width;
    this.height = this.map.height;
    this.c = true;
    this.cache = [];
  }
  /**
   * Gets a layer from the tiled map.
   * @param {number} z - The layer index.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} w - The width.
   * @param {number} h - The height.
   * @returns {ImageData} - The layer image data.
   */
  getLayer(z, x, y, w, h) {
    try {
      if (this.c) {
        this.cache[z] = this.map.layers[z].draw();
        this.c = false;
      }

      return this.cache[z].getImageData(
        x || 0,
        y || 0,
        w || this.map.width,
        h || this.map.height
      );
    } catch {
      return Canvas.createImageData(this.map.width, this.map.height);
    }
  }
  /** Sets a tile in the tiled map.
   * @param {number} z - The layer index.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} id - The tile id.
   */
  setTile(z, x, y, id) {
    this.map.layers[z].layer[x + y * this.map.width] = [
      this.map.getTile(id),
      id,
    ];
    this.c=true
  }
  /**
   * Gets a tile from the tiled map.
   * @param {number} z - The layer index.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @returns {number} - The tile id.
   */
  getTile(z, x, y) {
    return this.map.layers[z].layer[Math.floor(x/this.map.tilewidth) + Math.floor(y/this.map.tilewidth) * (this.map.width/this.map.tilewidth)][1];
  }
  /**
   * Gets the number of layers in the map.
   * @returns {number} - The number of layers in the map.
   */
  getLayers() {
    return this.map.layers.length;
  }
}
