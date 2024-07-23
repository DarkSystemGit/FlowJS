export class GFX {
    /**
     * Drawing interface
     * @param {Engine} engine Engine object
     */
    constructor(engine: Engine);
    ctx: any;
    engine: Engine;
    /**
     * Draw a object to the screen
     * @param {Number} x X cord
     * @param {Number} y Y cord
     * @param {Number} z Z cord
     * @param {PixelArray|Texture|Map|Text} pixels PixelArray, Texture, Text or Map to draw
     * @returns {Number}
     */
    draw(x: number, y: number, z: number, pixels: PixelArray | Texture | Map | Text): number;
    /**
     * Moves a Object around the screen
     * @param {Number} id Object ID
     * @param {Object} newPosition New Position
     * @param {Number} newPosition.x X Cord
     * @param {Number} newPosition.y Y Cord
     *  @param {number} newPosition.z Z Cord
     */
    moveObject(id: number, newPosition: {
        x: number;
        y: number;
        z: number;
    }): void;
    /**
     * Gets an objects data
     * @param {number} id Object ID
     * @returns {object}
     */
    getObject(id: number): object;
    /**
     * Changes an object's texture
     * @param {number} id Object ID
     * @param {Texture|PixelArray} texture New Texture
     */
    changeObjectTexture(id: number, texture: Texture | PixelArray): void;
    /**
     * Rotates a object
     * @param {number} id Object ID
     * @param {number} degrees Rotation Angle
     */
    rotateObject(id: number, degrees: number): void;
    /**
     * Fills a layer with a color
     * @param {Array<number>} color RGBA color
     */
    fillLayer(layer: any, color: Array<number>): void;
    /** Gets an asset's texture
     * @param {String} texture
     * @returns {Texture} Asset texture
     */
    getTexture(texture: string): Texture;
    /**
     * Gets a map
     * @param {String} name Map name
     * @returns {Map} Map
     */
    getMap(name: string): Map;
    /**
     * Sets layer background
     * @param {Texture|String} texture
     */
    setLayerBackground(layer: any, texture: Texture | string): void;
    /**
     * Update engine instance
     * @param {Engine} engine Engine object
     */
    updateEngine(engine: Engine): void;
}
import { PixelArray } from "./texture.js";
import { Texture } from "./texture.js";
import { Map } from "./tiled.js";
import { Text } from "./text.js";
