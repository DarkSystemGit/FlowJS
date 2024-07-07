/**
 * Game interface to be implemented by user
 * @member {GFX} gfx
 * @property {Engine} engine
 */
export class Game {
    /**
     * Constructs a new Game instance with the provided GFX and Engine.
     * @param {GFX} gfx - The GFX instance used for rendering.
     * @param {Engine} engine - The Engine instance used for game logic.
     * @property {GFX} gfx - The GFX instance used for rendering.
     * @property {Engine} engine - The Engine instance used for game logic.
     * @property {AudioManager} audio - The Audio instance from the Engine.
     * @property {Object} camera - An object with methods to control the camera.
     * @property {Function} camera.setPosition - Sets the camera position.
     * @property {Function} camera.getPosition - Gets the current camera position.
     * @property {Function} camera.move - Moves the camera by the specified x and y values.
     * @property {Sprite[]} sprites - An array of Sprite instances to be rendered.
     * @property {Function} shader - A function that sets the shader to be used by the Engine.
     */
    constructor(gfx: GFX, engine: Engine);
    gfx: GFX;
    engine: Engine;
    audio: AudioManager;
    camera: {
        setPosition: (x: any, y: any) => void;
        getPosition: () => number[];
        move: (x: any, y: any) => void;
    };
    sprites: any[];
    /**
     * Called on each frame
     */
    _onFrame(): void;
    /** Adds a Sprite to be drawn
     * @param {Sprite} sprite
     * @returns {Number} Sprite id
     */
    addSprite(sprite: Sprite): number;
    /**
     * Removes a sprite
     * @param {Number} id
     */
    removeSprite(id: number): void;
    /**
     * Internal method to add events
     * @param {String} method
     * @param {Function} handler
     */
    _rEv(method: string, handler: Function): void;
}
import { GFX } from "./gfx.js";
import { Engine } from "./engine.js";
import { AudioManager } from "./audio.js";
import { Sprite } from "./sprite.js";
