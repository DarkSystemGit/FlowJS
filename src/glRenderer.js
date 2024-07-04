import createRegl from "regl";
import gl from '@kmamal/gl'
export class GlRenderer {
  constructor(window) {
    this.window=window
    this.gl = gl(window.width,window.height,{window:window.native});
    this.regl = createRegl({ gl: this.gl });
    this.texture = { width: 0, height: 0, data: null };
    this.uniforms={}
    this.shaders = [
      `
    precision mediump float;
    uniform sampler2D frame;
    varying vec2 uv;
  void main () {
    gl_FragColor = texture2D(frame, uv);
  }`,
      `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`,
    ];
    this.renderer=this.regl({
      frag:this.shaders[0],
      vert:this.shaders[1],
      attributes:{
        position:[-2,0,0,-2,2,2]
      },
      uniforms:{frame:()=>this.regl.texture(this.texture),...this.uniforms},
      count:3
    })
  }
  setShader(shader) {
    this.shaders[0] = `
    precision mediump float;
    uniform sampler2D frame;
    varying vec2 uv;
    ${shader}
    `;
    this.recompile();
  }
  setShaderProperty(name,val){
    this.uniforms[name]=val
    this.recompile()
  }
  recompile(){
    this.renderer=this.regl({
      frag:this.shaders[0],
      vert:this.shaders[1],
      attributes:{
        position:[-2,0,0,-2,2,2]
      },
      uniforms:{frame:()=>this.regl.texture(this.texture),...this.uniforms},
      count:3
    })
  }
  render(width,height,frame) {
    this.texture={width,height,data:frame}
    this.regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });
    this.renderer()
    this.gl.swap()
  }
}
