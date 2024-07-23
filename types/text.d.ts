export class TextManager {
    constructor(ctx: any);
    ctx: any;
    textBlocks: any[];
    fonts: Map<any, any>;
    loadFont(name: any, path: any): void;
    drawText(block: any): void;
}
/**
 * Represents a text object with various properties for rendering text.
 *
 * @class Text
 * @param {string} [text=''] - The text content.
 * @param {boolean} [ui=false] - Whether the text is part of the UI.
 * @param {number} [width=0] - The width of the text.
 * @param {number} [height=0] - The height of the text.
 * @param {number[]} [color=[0, 0, 0, 255]] - The RGBA color of the text.
 * @param {string} [font='Arial'] - The font family of the text.
 * @param {number} [size=12] - The font size of the text.
 */
export class Text {
    constructor(text?: string, ui?: boolean, width?: number, height?: number, color?: number[], font?: string, size?: number);
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    font: string;
    ui: boolean;
    /**
     * Sets the string to be displayed
     * @param {String} text
     */
    setText(text: string): void;
    /**
     * Sets the text block's dimensions
     * @param {Number} width
     * @param {Number} height
     */
    setDimensions(width: number, height: number): void;
    /**
     * Sets the text's color
     * @param {Number[]} color
     */
    setColor(color: number[]): void;
    /**
     * Sets the font and size
     * @param {String} font
     * @param {Number} size
     */
    setFont(font: string, size: number): void;
}
