"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimCanvas = exports.obtainPixelArray = exports.obtainImageData = exports.fillCircle = exports.createCanvas = exports.getContext = void 0;
function getContext(canvas) {
    // @ts-expect-error -- Could potentially return null, but we won't account for that case
    return canvas.getContext("2d");
}
exports.getContext = getContext;
function createCanvas(width, height) {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = width;
    newCanvas.height = height;
    return [newCanvas, getContext(newCanvas)];
}
exports.createCanvas = createCanvas;
function fillCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
}
exports.fillCircle = fillCircle;
function obtainImageData(canvas) {
    return getContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
}
exports.obtainImageData = obtainImageData;
function obtainPixelArray(canvas) {
    return obtainImageData(canvas).data;
}
exports.obtainPixelArray = obtainPixelArray;
function trimCanvas(canvas) {
    const ctx = getContext(canvas);
    const imageData = obtainImageData(canvas);
    const xs = [];
    const ys = [];
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
    const cut = ctx.getImageData(minX, minY, 1 + Math.max(...xs) - minX, 1 + Math.max(...ys) - minY);
    canvas.width = cut.width;
    canvas.height = cut.height;
    ctx.putImageData(cut, 0, 0);
    return canvas;
}
exports.trimCanvas = trimCanvas;
