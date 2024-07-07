export function createImageBitmap(pix: any, w: any, h: any): any;
export function clone(obj: any): any;
export function angle(anchor: any, point: any): number;
export function colliding(obj1: any, obj2: any): boolean;
export function processArr(array: any): any;
export function getPixels(file: any): Promise<{
    shape: any[];
    data: Uint8ClampedArray;
}>;
export function indexesOf(arr: any, item: any): any;
export function err(err: any): never;
export function brc({ numBands, data, height, width }: {
    numBands?: number;
    data: any;
    height: any;
    width: any;
}): {
    data: any[][][];
};
