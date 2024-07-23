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
    /** Get the array's rotation angle (Not implemented)
     * @returns {Number}
     */
    getAngle(): number;
}
export class Texture extends PixelArray {
    constructor(...args: any[]);
    /**
     * Resizes a texture to a specific size
     * @param {Number} width
     * @param {Number} height
     */
    setDimensions(width: number, height: number): void;
    rotation: number;
}
