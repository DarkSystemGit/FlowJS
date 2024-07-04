import createRegl from "regl";
import gl from '@kmamal/gl'
export class GlRenderer {
  constructor(window) {
    this.window=window
    this.gl = gl(window.width,window.height,{window:window.native});
    this.regl = createRegl({ gl: this.gl });
    this.texture = this.regl.texture({ flipY:true,width: 0, height: 0, data: null });
    this.uniforms={}
    this.shaders = [
      `
    precision mediump float;
    uniform sampler2D frame_R;
    varying vec2 uv;
  void main () {
    gl_FragColor = vec4(texture2D(frame_R, uv).g,texture2D(frame_R, uv).b,texture2D(frame_R, uv).a,texture2D(frame_R, uv).r );
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
      uniforms:{frame_R:()=>this.texture,...this.uniforms},
      count:3
    })
  }
  setShader(shader) {
    this.shaders[0] = `
    precision mediump float;
    uniform sampler2D frame;
    varying vec2 uv;
    vec4 getPixel(){
      return vec4(texture2D(frame, uv).g,texture2D(frame, uv).b,texture2D(frame, uv).a,texture2D(frame, uv).r );
    }
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
      uniforms:{frame_R:()=>this.texture,...this.uniforms},
      count:3
    })
  }
  render(width,height,frame) {
    this.texture=this.texture({width,height,data:frame.reverse()})
    this.regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });
    this.renderer()
    this.gl.swap()
  }
}
