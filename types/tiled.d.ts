export class Map {
    /**
     * Loads a tiled map.
     * @param {string} file - The path to the tiled map file.
     */
    constructor(file: string);
    map: {
        tilesets: any;
        layers: any;
        getTile: (id: any) => any;
        width: number;
        height: number;
    };
    width: number;
    height: number;
    c: boolean;
    cache: any[];
    /**
     * Gets a layer from the tiled map.
     * @param {number} z - The layer index.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {number} w - The width.
     * @param {number} h - The height.
     * @returns {ImageData} - The layer image data.
     */
    getLayer(z: number, x: number, y: number, w: number, h: number): ImageData;
    /** Sets a tile in the tiled map.
     * @param {number} z - The layer index.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {number} id - The tile id.
     */
    setTile(z: number, x: number, y: number, id: number): void;
    /**
     * Gets a tile from the tiled map.
     * @param {number} z - The layer index.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {number} - The tile id.
     */
    getTile(z: number, x: number, y: number): number;
    /**
     * Gets the number of layers in the map.
     * @returns {number} - The number of layers in the map.
     */
    getLayers(): number;
}
