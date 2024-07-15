import { XMLParser } from "fast-xml-parser";
import path from "path";
import fs from "fs";
import Canvas from "canvas";
import { getPixels, err, createImageBitmap } from "./utils.js";
function parse(mapPath) {
  var map = JSON.parse(fs.readFileSync(mapPath));
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
        }
        draw(ctx) {
          var tCtx = Canvas.createCanvas(
            map.width * map.tilewidth,
            map.height * map.tileheight
          ).getContext("2d");
          switch (map.renderorder) {
            default:
              err("Invalid renderorder");
            case "right-down":
              for (var i = 0; i < this.layer.length; i++)
                this.drawTile(i, this.layer, tCtx);
          }
          ctx.drawImage(tCtx.canvas, 0, 0);
          return ctx;
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
  return { tilesets, layers, getTile };
}
var map = await parse("./test/map.json");
fs.writeFileSync(
  "./tile.png",
  map.layers[0]
    .draw(Canvas.createCanvas(1280, 720).getContext("2d"))
    .canvas.toBuffer("image/png")
);
//fs.writeFileSync('./tile.rgba',JSON.stringify(Array.from(map.getTile(1964).data)).replace('[','').replace(']',''))
