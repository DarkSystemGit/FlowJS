#version 300 es
in vec4 pixel
in int i
in int width
${eParamsDef}
out vec4 color
vec4 shader(vec4 pixel, int x, int y)
void main(){
    int x=i% dims[0]
    int y=i/dims[0]
    color = shader(pixel,x,y${eParams})
}
vec4 shader(vec4 pixel, int x, int y${efParams}){
    ${shaderContents}
}
