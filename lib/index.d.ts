export declare function getContext(canvas: HTMLCanvasElement, readFrequently?: boolean): CanvasRenderingContext2D;
export declare function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D];
export declare function createOffscreenCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D];
export declare function fillCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
export declare function obtainImageData(canvas: HTMLCanvasElement): ImageData;
export declare function obtainPixelArray(canvas: HTMLCanvasElement): Uint8ClampedArray;
export declare function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement;
export type RandomNumberGenerator = () => number;
export declare function createPRNGGenerator(seed: number): RandomNumberGenerator;
export declare function numberBetween(target: number, a: number, b: number): number;
export declare function integerNumberBetween(target: number, a: number, b: number): number;
export type CanvasFragment = [
    fragment: HTMLCanvasElement,
    top: number,
    left: number
];
export declare function createCanvasFragments(targetCanvas: HTMLCanvasElement, rng: RandomNumberGenerator, desiredSize?: number): Array<CanvasFragment>;
