import {Image,createCanvas} from 'canvas'
function getPixel(canvas,x,y){
    var w=canvas.width
    var data=canvas.getImageData(0,0,w,canvas.height)
    var gc=(o)=>data.data[y*(image.width*4)+x*4+o]
    return {r:gc(0),g:gc(1),b:gc(2),a:gc(3)}
}
function drawPixel(canvas,x,y,color){
    var w=canvas.width
    var data=canvas.getImageData(0,0,w,canvas.height)
    var sc=(o,v)=>data.data[y*(image.width*4)+x*4+o]=v
    Object.keys(color).forEach((c,i)=>sc(i,color[c]))
    canvas.putImageData(data,0,0)
}