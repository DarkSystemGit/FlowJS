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
  shader=getFunction('main',shader) 
  console.log(shader)
  var params=shader.params.filter((i)=>!(['vec4 pixel', 'int x', 'int y'].includes(i)))

  return generate(parser.parse(`
    in vec4 pixel;
    in int i;
    in int width;
    ${params.map((p)=>'in '+p).join(';')+';'}
    out vec4 color;
    vec4 shader(vec4 pixel, int x, int y);
    void main(){
        int x=i% dims[0];
        int y=i/dims[0];
        color = shader(pixel,x,y${','+params.map((p)=>p.split(' ')[1]).join(',')});
    }
    vec4 shader(vec4 pixel, int x, int y${','+params.join(',')}){
        ${shader.body}
    }
    `));
};
console.log(genShader(`vec4 main(vec4 pixel, int x, int y, float lights){
    return pixel;
}
`))