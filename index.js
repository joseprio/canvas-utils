export function getContext(canvas) {
  return canvas.getContext("2d");
}

export function createCanvas(width, height) {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  return [newCanvas, getContext(newCanvas)];
}

export function fillCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
}

export function obtainImageData(canvas) {
  return getContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
}

export function iterateImageData(imageData, callback) {
  let pos = 0;
  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      callback(imageData.data.subarray(pos, (pos += 4)), x, y);
    }
  }
}

export function trimCanvas(canvas) {
  const ctx = getContext(canvas);
  const xs = [];
  const ys = [];
  iterateImageData(obtainImageData(canvas), (pixel, x, y) => {
    if (pixel[3]) {
      xs.push(x);
      ys.push(y);
    }
  });
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
