import {err, IPC} from "./utils.js";
/**
 * Manages tiled map operations in the application.
 */
export class TiledManager {
  /**
   * Constructs a new TiledManager instance.
   */
  constructor() {
    this.ipc = new IPC("tiledWorker.js")
  }

  /**
   * Loads a tiled map.
   * @param {string} file - The path to the tiled map file.
   * @returns {Promise<void>} - A Promise that resolves when the map is initialized.
   */
  async load(file) {
    try {
      await this.ipc.send("init", { file })
    } catch {
      err("Error while initializing tiled map")
    }
  }

  /**
   * Gets a layer from the tiled map.
   * @param {number} z - The layer index.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} w - The width.
   * @param {number} h - The height.
   * @returns {Promise<ImageData>} - A Promise that resolves with the layer image data.
   */
  async getLayer(z, x, y, w, h) {
    try {
      return await this.ipc.send("getLayer", { z, x, y, w, h })
    } catch {
      err("Error while getting layer")
    }
  }

  /**
   * Sets a tile in the tiled map.
   * @param {number} z - The layer index.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} id - The tile id.
   * @returns {Promise<void>} - A Promise that resolves when the tile is set.
   */
  async setTile(z, x, y, id) {
    try {
      await this.ipc.send("setTile", { z, x, y, id })
    } catch {
      err("Error while setting tile")
    }
  }

  /**
   * Gets a tile from the tiled map.
   * @param {number} z - The layer index.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @returns {Promise<number>} - A Promise that resolves with the tile id.
   */
  async getTile(z, x, y) {
    try {
      return await this.ipc.send("getTile", { z, x, y })
    } catch {
      err("Error while getting tile")
    }
  }
}
