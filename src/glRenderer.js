import createRegl from "regl";
import gl from '@kmamal/gl'
export class GlRenderer {
  constructor(window) {
    this.window=window
    this.gl = gl(window.width,window.height,{window:window.native});
    this.regl = createRegl({ gl: this.gl });
    this.texture = this.regl.texture({width: 0, height: 0, data: null });
    this.glx=this.gl.getExtension('STACKGL_resize_drawingbuffer')
    this.uniforms={}
    this.shaders = [
      `
    precision mediump float;
    uniform sampler2D frame_R;
    varying vec2 uv;

  void main () {
    gl_FragColor = vec4(texture2D(frame_R, uv).b,texture2D(frame_R, uv).g,texture2D(frame_R, uv).r,texture2D(frame_R, uv).a );
  }`,
      `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = vec2(1.00-position.x,position.y);
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`,
    ];
    this.renderer=this.regl({
      frag:this.shaders[0],
      vert:this.shaders[1],
      attributes:{
        position:[-2,0,0,-2,2,2]
      },
      uniforms:{frame_R:()=>this.texture,...this.uniforms},
      count:3
    })
    this.window.on('resize', ({ width: w, height: h, pixelWidth: pw, pixelHeight: ph }) => {
      this.glx.resize(pw, ph)
      this.gl.viewport(0, 0, w, h)
      //this.gl.swap()
    })
  }
  //color:bgra
  setShader(shader) {
    this.shaders[0] = `
   precision mediump float;
    uniform sampler2D frame_R;
    varying vec2 uv;
    uniform vec2 viewport;
    vec4 getPixel(){
      return vec4(texture2D(frame_R, uv).b,texture2D(frame_R, uv).g,texture2D(frame_R, uv).r,texture2D(frame_R, uv).a );
    }
    vec2 getPosition(){
      return vec2((gl_FragCoord.x/viewport.x),1.00-(gl_FragCoord.y/viewport.y));
    }
    ${shader}
    `;
    this.recompile();
  }
  setShaderProperty(obj){
    this.uniforms={...this.uniforms,...obj}
    this.recompile()
  }
  recompile(){
    this.renderer=this.regl({
      frag:this.shaders[0],
      vert:this.shaders[1],
      attributes:{
        position:[-2,0,0,-2,2,2]
      },
      uniforms:{frame_R:()=>this.texture,viewport:()=>this.viewport,...this.uniforms},
      count:3
    })
  }
  render(width,height,frame) {
    this.viewport=[width,height]
    this.texture=this.texture({width,height,data:frame})
    this.regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });
    this.renderer()
    this.gl.swap()
  }
}
