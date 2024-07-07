export class Sprite {
    /**
     * Constructs a new Sprite instance.
     * @param {Game} game - The game instance that the sprite belongs to.
     * @constructor
     */
    constructor(game: Game);
    /**
     * Constructs a new sprite object.
     * @param {Object} game - The game object that contains the necessary components for the sprite.
     * @param {Object} game.gfx - The graphics component.
     * @param {Object} game.engine - The engine component.
     * @param {Object} game.audio - The audio component.
     * @param {Object} game.camera - The camera component.
     * @property {Object} obj - The object representation of the sprite.
     * @property {number} obj.x - The x-coordinate of the sprite.
     * @property {number} obj.y - The y-coordinate of the sprite.
     * @property {number} obj.z - The z-coordinate of the sprite.
     * @property {Object} position - The position of the sprite.
     * @property {number} position.x - The x-coordinate of the sprite's position.
     * @property {number} position.y - The y-coordinate of the sprite's position.
     * @property {Array.<number>} velocity - The velocity of the sprite.
     * @property {number} width - The width of the sprite.
     * @property {number} height - The height of the sprite.
     * @property {Array.<string>} events - The events that the sprite can listen for.
     * @property {Function} onClick - The function to be called when the sprite is clicked.
     * @property {Function} onCreate - The function to be called when the sprite is created.
     * @property {Function} onFrame - The function to be called on each frame.
     */
    gfx: any;
    engine: any;
    audio: any;
    camera: any;
    obj: {
        x: number;
        y: number;
        z: number;
    };
    position: {
        x: number;
        y: number;
    };
    velocity: number[];
    width: number;
    height: number;
    /**
       * Checks if the sprite is in a range
       * @param {Number} width
       * @param {Number} height
       * @param {Number} minWidth
       * @param {Number} minHeight
       * @returns {Boolean}
       */
    inBounds(width: number, height: number, minWidth: number, minHeight: number): boolean;
    /**
     * Loads a texture
     * @param {String|Texture} texture Asset or Texture to load
     */
    loadTexture(texture: string | Texture): void;
    texture: any;
    /**
     * Renders the sprite to the screen
     */
    render(): void;
    id: any;
    /**
     * Changes the sprite
     * @param {Object} newObj
     */
    changeSprite(newObj: any): void;
    /**
     * Moves a sprite to a x,y position
     * @param {Number} x
     * @param {Number} y
     */
    move(x: number, y: number): void;
    /**
     * Rotates a sprite
     * @param {Number} degrees
     */
    rotate(degrees: number): void;
    /**
     * Changes a sprite's velocity
     * @param {Number} x
     * @param {Number} y
     */
    changeVelocity(x: number, y: number): void;
    /**
     * Changes a sprites Z-axis
     * @param {Number} layer
     */
    changeLayer(layer: number): void;
    /**
     * Gets colliding objects
     * @returns {Array<Object>}
     */
    getCollisions(): Array<any>;
}
