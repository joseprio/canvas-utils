export function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  // @ts-expect-error -- Could potentially return null, but we won't account for that case
  return canvas.getContext("2d");
}

export function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  return [newCanvas, getContext(newCanvas)];
}

export function fillCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
}

export function obtainImageData(canvas: HTMLCanvasElement): ImageData {
  return getContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
}

export function obtainPixelArray(canvas: HTMLCanvasElement): Uint8ClampedArray {
  return obtainImageData(canvas).data;
}

export function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = getContext(canvas);
  const imageData = obtainImageData(canvas);
  const xs: Array<number> = [];
  const ys: Array<number> = [];
  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      if (imageData.data[(y * imageData.width + x) * 4 + 3]) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const cut = ctx.getImageData(
    minX,
    minY,
    1 + Math.max(...xs) - minX,
    1 + Math.max(...ys) - minY
  );

  canvas.width = cut.width;
  canvas.height = cut.height;
  ctx.putImageData(cut, 0, 0);
  return canvas;
}

export type RandomNumberGenerator = () => number;

export function createPRNGGenerator(seed: number): RandomNumberGenerator {
  const ints = new Uint32Array([
    Math.imul(seed, 0x85ebca6b),
    Math.imul(seed, 0xc2b2ae35),
  ]);

  return () => {
    const s0 = ints[0];
    const s1 = ints[1] ^ s0;
    ints[0] = ((s0 << 26) | (s0 >> 8)) ^ s1 ^ (s1 << 9);
    ints[1] = (s1 << 13) | (s1 >> 19);
    return (Math.imul(s0, 0x9e3779bb) >>> 0) / 0xffffffff;
  };
}

// Converts a number between 0 and 1 to a number between [a, b)
export function numberBetween(target: number, a: number, b: number): number {
  return target * (b - a) + a;
}

// Converts a number between 0 and 1 to an integer number between [a,b] (both included)
export function integerNumberBetween(
  target: number,
  a: number,
  b: number
): number {
  return Math.floor(numberBetween(target, a, b + 1));
}