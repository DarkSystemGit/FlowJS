import { XMLParser } from 'fast-xml-parser';
import path from 'path'
import fs from "fs";
import Canvas from 'canvas'
import { getPixels } from './utils.js';
function parse(mapPath){
    var map=JSON.parse(fs.readFileSync(mapPath))
    var tilesets=map.tilesets.map(tileset=>{
        return new XMLParser({attributeNamePrefix : "@_",ignoreAttributes: false}).parse(fs.readFileSync(path.join(path.dirname(mapPath),tileset.source)).toString())
    }).map(t=>new (class Tileset{
        constructor(t){
            var c=Canvas.createCanvas(parseInt(t.tileset.image['@_width']),parseInt(t.tileset.image['@_height']))
            this.image=c.getContext('2d')
            this.cols=parseInt(t.tileset['@_columns'])
            this.spacing=parseInt(t.tileset['@_spacing'])||0
            this.dims=[parseInt(t.tileset.image['@_width']),parseInt(t.tileset.image['@_height'])]
            this.tDims=[parseFloat(t.tileset['@_tilewidth']),parseFloat(t.tileset['@_tileheight'])]
            this.tileDims=[parseFloat(t.tileset['@_tilewidth'])+(parseFloat(t.tileset['@_spacing'])||0),parseFloat(t.tileset['@_tileheight'])+(parseFloat(t.tileset['@_spacing'])||0)]
            var tileset=getPixels(fs.readFileSync(path.join(path.dirname(mapPath),t.tileset.image['@_source'])))
            this.image.putImageData(Canvas.createImageData(tileset.data,...tileset.shape),0,0)
            
        }
        getTile(id){
            //Cusred tiled stuff
            id=(id&0x0fffffff)
            var pos=[(id%this.cols)*this.tileDims[0],Math.floor(id/this.cols)*this.tileDims[1]]
            return this.image.getImageData(...pos,this.tileDims[0]-this.spacing,this.tileDims[1]-this.spacing)
        }
        getTiles(){return Math.floor(this.dims[0]/this.tileDims[0])*Math.floor(this.dims[1]/this.tileDims[1])-1}
    })(t))
    const getTile=id=>{
        var previd=0
        try{
        return tilesets.find(t=>{
            if(t.getTiles()+previd>id&&id>previd)return t
            previd=t.getTiles()+previd
        }).getTile(id-previd-1)
    }catch{return Canvas.createImageData(map.tilewidth,map.tileheight)}
    }
    var layers=map.layers.map(l=>new (class Layer{
        constructor(layer){
            this.layer=layer.data.map(id=>getTile(id))
        }
    })(l))
    return {tilesets,layers,getTile}
}
var map=await parse('./test/map.json')
console.log(map.layers[0].layer)
//fs.writeFileSync('./tile.rgba',JSON.stringify(Array.from(map.getTile(1964).data)).replace('[','').replace(']',''))