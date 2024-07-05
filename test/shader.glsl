void main(){
    gl_FragColor=getPixel()+vec4(getPosition().xy,0,0);
}