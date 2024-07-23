/**
 * The Engine class is the main game engine that manages the game loop, rendering, and other core game systems.
 * It takes in a game class, screen dimensions, window title, and scale factor to initialize the game.
 *
 * @param {Object} game - The game class that will be used to handle game logic.
 * @returns {Promise<Engine>} A Promise that resolves to the initialized Engine instance.
 */
export class Engine {
    constructor(game: any);
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
    tilesets: {};
    mouseClicks: any[];
    shaders: any[];
    camera: number[];
    keyboard: number[][];
    audio: AudioManager;
    text: TextManager;
    assets: AssetManager;
    maps: any[];
    utils: {
        screenToWorld: (x: any, y: any) => number[];
        worldToScreen: (x: any, y: any) => number[];
    };
    onFrame: (a: any) => void;
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
     * Gets a loaded map
     * @param {String} name
     */
    getMap(name: string): any;
    /**
     * Draws a map to the screen
     * @param {Map} map Map
     * @param {Number} x X cord
     * @param {Number} y Y cord
     * @param {Number} z Z cord
     */
    drawMap(map: Map<any, any>, x: number, y: number, z: number): void;
    /**
     * Draws text to the screen
     * @param {Text} text
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    drawText(text: Text, x: number, y: number, z: number): void;
    _onFrame(): void;
    /**
     *  Changes an object
     * @param {Number} id Object ID
     * @param {Object} newObj Updated Properties
     */
    changeObject(id: number, newObj: any): void;
    /** Internal method that actually draws to the screen */
    _drawObjects(): Promise<void>;
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
     * Loads a map
     * @param {String} file File Path
     * @param {String} name Asset Name
     * @returns {Map} Map
     */
    loadMap(file: string, name: string): Map<any, any>;
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
import { TextManager } from "./text.js";
import { Texture } from "./texture.js";
