import { parser, generate } from "@shaderfrog/glsl-parser";
import { visit } from "@shaderfrog/glsl-parser/ast/index.js";
const getFunction = (func, file) => {
  var ret;
  visit(
    parser.parse(file),
    {
      function_header: {
        enter: (p) => {
          if (p.node.name.identifier != func) return;
          var shaderFunc = { params: [] };
          shaderFunc.ret = p.node.returnType.specifier.specifier.token;
          shaderFunc.name = p.node.name.identifier;
          p.parent.parameters.forEach((p) => {
            shaderFunc.params.push(
              p.specifier.specifier.token + " " + p.identifier.identifier
            );
          });
          shaderFunc.body = generate(p.parentPath.parent.body);
          ret = shaderFunc;
        },
      },
    }
  );
  return ret;
};
const genShader = (shader) => {
  shader=getFunction('shader',shader) 
  console.log(shader) 
  var params=shader.params.filter((i)=>!(['vec4 pixel', 'int x', 'int y'].includes(i)))

  return `#version 300 es
    in vec4 pixel;
    in int i;
    in int width;
    ${eParamsDef}
    out vec4 color;
    vec4 shader(vec4 pixel, int x, int y);
    void main(){
        int x=i% dims[0];
        int y=i/dims[0];
        color = shader(pixel,x,y${eParams});
    }
    vec4 shader(vec4 pixel, int x, int y${efParams}){
        ${shaderContents}
    }
    `;
};
console.log(genShader(`
vec4 shader(vec4 pixel, int x, int y, float[] lights,float lightsLength){
    vec4 lpixel=pixel;
    vec4 lightedPix[lightsLength];
    for(int pix=0;pix<lightsLength;++pix)
      {
      lightedPix[pix]=vec4(lpixel.r,lpixel.g,lpixel.b,lpixel.a*lights[pix]);
    }
}
`))