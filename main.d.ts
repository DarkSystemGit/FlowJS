export class PixelArray {
    constructor(w: any, h: any, data: any);
    obj: {
        data: any;
        shape: any[];
    };
    /**
     * Fills the Array
     * @param {Array<number>} color RGBA color
     */
    fill(color: Array<number>): void;
    /**
     * Sets a pixel in the array
     * @param {Number} x X cord
     * @param {Number} y Y cord
     * @param {Array<Number>} value RGBA color
     */
    set(x: number, y: number, value: Array<number>): void;
    /** Internal method to get the array's data */
    _getData(): Uint8ClampedArray;
    /**
     * Get the array's dimensions
     * @returns {Array<Number>}
     */
    getShape(): Array<number>;
    /** Get the array's rotation angle
     * @returns {Number}
     */
    getAngle(): number;
}
export class Texture extends PixelArray {
    constructor(...args: any[]);
    /**
     * Rotates a Texture
     * @param {Number} degrees Degrees to rotate
     */
    rotate(degrees: number): void;
    rotation: number;
}
export class Engine {
    /**
     * Game Engine
     * @param {*} handlerClass Game class
     * @param {*} dimensions Screen dimensions
     * @param {*} scale Scale factor
     * @param {*} title Window Title
     * @returns
     */
    constructor(handlerClass: any, dimensions: any, scale: any, title: any);
    window: any;
    events: {
        keyboard: {};
        mouse: {};
    };
    canvas: any;
    ctx: any;
    scale: any;
    dimensions: any;
    uuid: number;
    objects: any;
    mouse: any[];
    assets: AssetManager;
    onFrame: (a: any) => any;
    /**
     * Loads an asset
     * @param {String} path Path to file
     * @param {String} name Name of asset
     */
    loadAsset(path: string, name: string): Promise<void>;
    /** Lists loaded assets
     * @returns {Array<String>}
     */
    listAssets(): Array<string>;
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
    draw(pixels: ImageData, x: number, y: number, z: number, shape: Array<number>, angle: number, oldid: number): number;
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
     * @returns
     */
    _getObject(id: number): undefined;
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
declare class AssetManager {
    assets: {};
    /**
     * Loads a texture
     * @param {String} file File Path
     * @param {String} name Asset Name
     * @returns {Object} Asset
     */
    loadTexture(file: string, name: string): any;
    /**
     * Deletes a texture from storage
     * @param {String} name Asset Name
     */
    removeTexture(name: string): void;
    /**
     * Gets a texture
     * @param {String} name Asset Name
     * @returns
     */
    getTexture(name: string): Texture;
    /**
     * List loaded assets
     * @returns {Array<String>} Asset Names
     */
    listTextures(): Array<string>;
}
export {};
//# sourceMappingURL=main.d.ts.map