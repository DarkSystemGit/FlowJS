export class GlRenderer {
    constructor(window: any);
    window: any;
    gl: import("@kmamal/gl").WebGLRenderingContext;
    regl: any;
    texture: any;
    glx: import("@kmamal/gl").STACKGL_resize_drawingbuffer;
    uniforms: {};
    shaders: string[];
    renderer: any;
    setShader(shader: any): void;
    setShaderProperty(obj: any): void;
    recompile(): void;
    render(width: any, height: any, frame: any): void;
    viewport: any[];
}
