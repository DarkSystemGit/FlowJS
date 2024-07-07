/**
 * @class Engine
 * @description Game Engine
 * @param {Class} handlerClass Game class
 * @param {Array<number>} dimensions Screen dimensions
 * @param {String} title Window Title
 * @param {Number[]} scale Scale factor
 */
export class Engine {
    constructor(handlerClass: any, dimensions: any, title: any, scale: any);
    window: Renderer;
    events: {
        keyboard: {};
        mouse: {};
    };
    canvas: any;
    ctx: any;
    scale: any;
    dimensions: any;
    uuid: number;
    objects: Map<any, any>;
    mouse: any[];
    mouseClicks: any[];
    shaders: any[];
    camera: number[];
    keyboard: number[][];
    audio: AudioManager;
    assets: AssetManager;
    utils: {
        screenToWorld: (x: any, y: any) => number[];
        worldToScreen: (x: any, y: any) => number[];
    };
    onFrame: (a: any) => any;
    /**
     * Loads an asset
     * @param {String} path Path to file
     * @param {String} name Name of asset
     */
    loadAsset(path: string, name: string): Promise<any>;
    /** Lists loaded assets
     * @returns {Array<String>}
     */
    listAssets(): Array<string>;
    /**
     * Sets the game shader
     * @param {String} shader Shader asset
     * @param {Object} props Shader properties
     */
    setShader(shader: string, props: any): void;
    /**
     * Removes an asset from storage
     * @param {String} name Name of asset
     */
    removeAsset(name: string): void;
    /**
     * Converts a loaded asset to a texture
     * @param {String} name Name of asset
     * @returns {Texture}
     */
    convertAssetToTexture(name: string): Texture;
    /**
     * Gets current mouse position
     */
    getMousePos(): any;
    /**
     * Sets the camera position
     * @param {Number} x X cord
     * @param {Number} y Y cord
     */
    setCameraPosition(x: number, y: number): void;
    /**
     * Gets camera position
     * @returns {Array<number>} Camera position
     */
    getCameraPosition(): Array<number>;
    /**
     * Internal method to convert cooridinates from screen to world space, and vice-versa
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} screen
     * @returns {Array<number>}
     */
    _convertCords(x: number, y: number, screen: boolean): Array<number>;
    /**
     * Moves the camera around
     * @param {Number} x X movement
     * @param {Number} y Y movement
     */
    moveCamera(x: number, y: number): void;
    /**
     * Draws an object to the screen, returns a object id
     * @param {ImageData} pixels Object's ImageData
     * @param {Number} x X cord
     * @param {Number} y Y cord
     * @param {Number} z Z cord
     * @param {Array<number>} shape Dimensions
     * @param {Number} angle Rotation Angle
     * @param {Number} oldid
     * @returns {Number} Object ID
     */
    draw(pixels: ImageData, x: number, y: number, z: number, shape: Array<number>, angle: number, oldid: number, special: any): number;
    /**
     *  Changes an object
     * @param {Number} id Object ID
     * @param {Object} newObj Updated Properties
     */
    changeObject(id: number, newObj: any): void;
    /**
     * Internal method that actually draws objects to the screen
     */
    _drawObjects(): Promise<void>;
    /**
     * Draws a rotated object to the canvas
     * @param {Object} item - The object to be drawn
     */
    _drawRotatedObject(item: any): void;
    /**
     * Draws a non-rotated object to the canvas
     * @param {Object} item - The object to be drawn
     */
    _drawNonRotatedObject(item: any): void;
    /**
     * Draws a full-screen rectangle with a specified color
     * @param {Array} color - An array of RGBA values for the rectangle color
     */
    _drawFullscreenRect(color: any[]): void;
    /**
     * Draws a texture to the canvas
     * @param {Object} item - The object containing the texture data
     */
    _drawTexture(item: any): void;
    /**
     * Draws an image to the canvas
     * @param {Object} item - The object containing the image data
     */
    _drawImage(item: any): void;
    /**
     *  Internal method to get an Object
     * @param {Number} id Object ID
     * @returns {Object}
     */
    _getObject(id: number): any;
    /**
     * Gets colliding objects
     * @param {number} id Object ID
     */
    getObjectCollisions(id: number): any;
    /** Internal method to clear screen */
    _clear(): void;
    /**
     *  Internal method that registers a event with the engine
     * @param {String} event
     * @param {Function} handler
     */
    _registerEvent(event: string, handler: Function): void;
    /** Internal method to handle events*/
    _handleEvents(): void;
}
export class AssetManager {
    /** Internal class to manage asssets */
    constructor(aud: any);
    assets: {};
    audio: any;
    /**
     * Loads a audio stream
     * @param {String} file File Path
     * @param {String} name Asset Name
     * @returns {Object} Asset
     */
    loadAudio(file: string, name: string): any;
    /**
     * Loads a texture
     * @param {String} file File Path
     * @param {String} name Asset Name
     * @returns {Object} Asset
     */
    loadTexture(file: string, name: string): any;
    /**
     * Loads a file
     * @param {String} file File Path
     * @param {String} name Asset Name
     * @returns {Object} Asset
     */
    loadFile(file: string, name: string): any;
    /**
     * Gets a file from storage
     * @param {String} name file name
     */
    getFile(name: string): any;
    /**
     * Deletes a texture from storage
     * @param {String} name Asset Name
     */
    removeAsset(name: string): void;
    /**
     * Gets a texture
     * @param {String} name Asset Name
     * @returns {Object} Asset
     */
    getTexture(name: string): any;
    /**
     * List loaded assets
     * @returns {Array<String>} Asset Names
     */
    listAssets(): Array<string>;
}
import { Renderer } from "./renderer.js";
import { AudioManager } from "./audio.js";
import { Texture } from "./texture.js";
