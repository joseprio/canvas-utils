export function getContext(canvas, readFrequently) {
    if (readFrequently) {
        // @ts-expect-error -- Could potentially return null, but we won't account for that case
        return canvas.getContext("2d", { willReadFrequently: true });
    }
    // @ts-expect-error -- Could potentially return null, but we won't account for that case
    return canvas.getContext("2d");
}
export function createCanvas(width, height) {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = width;
    newCanvas.height = height;
    return [newCanvas, getContext(newCanvas)];
}
export function createOffscreenCanvas(width, height) {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = width;
    newCanvas.height = height;
    return [newCanvas, getContext(newCanvas, true)];
}
export function fillCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
}
export function obtainImageData(canvas) {
    return getContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
}
export function obtainPixelArray(canvas) {
    return obtainImageData(canvas).data;
}
export function trimCanvas(canvas) {
    const ctx = getContext(canvas, true);
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
export function createPRNGGenerator(seed) {
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
export function numberBetween(target, a, b) {
    return target * (b - a) + a;
}
// Converts a number between 0 and 1 to an integer number between [a,b] (both included)
export function integerNumberBetween(target, a, b) {
    return Math.floor(numberBetween(target, a, b + 1));
}
export function createCanvasFragments(targetCanvas, rng, desiredSize) {
    const COLLECTOR_MIN_X = 0;
    const COLLECTOR_MIN_Y = 1;
    const COLLECTOR_MAX_X = 2;
    const COLLECTOR_MAX_Y = 3;
    const COLLECTOR_CENTER_X = 4;
    const COLLECTOR_CENTER_Y = 5;
    const COLLECTOR_NEAREST = 6;
    const width = targetCanvas.width;
    const height = targetCanvas.height;
    const targetSize = desiredSize || Math.max(12, Math.floor(Math.min(width, height) / 12));
    const pixelArray = obtainPixelArray(targetCanvas);
    const xPoints = Math.floor(width / targetSize);
    const yPoints = Math.floor(height / targetSize);
    const collectors = [];
    const yOffset = Math.floor(height / yPoints / 2);
    const sprites = [];
    // Gather collectors
    for (let currentY = 0; currentY < yPoints; currentY++) {
        // We calculate the initial offset so the center points are in a displaced pattern
        const xOffset = Math.floor(width / ((2 - (currentY % 2)) * xPoints));
        for (let currentX = 0; currentX < xPoints - (currentY % 2); currentX++) {
            // We add some noise so all pieces look different
            collectors.push([
                1e9,
                1e9,
                0,
                0,
                Math.floor(xOffset + ((currentX + (rng() - 0.5)) * width) / xPoints),
                Math.floor(yOffset + ((currentY + (rng() - 0.5)) * height) / yPoints),
                [],
            ]);
        }
    }
    const processedPixels = Array(width * height);
    let addedAtLeastOne = false;
    function addPixelToCollector(x, y, collector) {
        if (x < 0 || y < 0 || x >= width || y >= height)
            return;
        const arrayIndex = y * width + x;
        if (processedPixels[arrayIndex])
            return;
        processedPixels[arrayIndex] = true;
        if (!pixelArray[arrayIndex * 4 + 3])
            return;
        addedAtLeastOne = true;
        collector[COLLECTOR_MIN_X] = Math.min(x, collector[COLLECTOR_MIN_X]);
        collector[COLLECTOR_MAX_X] = Math.max(x, collector[COLLECTOR_MAX_X]);
        collector[COLLECTOR_MIN_Y] = Math.min(y, collector[COLLECTOR_MIN_Y]);
        collector[COLLECTOR_MAX_Y] = Math.max(y, collector[COLLECTOR_MAX_Y]);
        collector[COLLECTOR_NEAREST].push([
            x,
            y,
            pixelArray.slice(arrayIndex * 4, arrayIndex * 4 + 4),
        ]);
    }
    let activeCollectors = collectors;
    let radius = 0;
    while (activeCollectors.length > 0) {
        activeCollectors = activeCollectors.filter((collector) => {
            addedAtLeastOne = false;
            if (radius) {
                for (let r = 0; r < 1 + 2 * (radius - 1); r++) {
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] - radius + 1 + r, collector[COLLECTOR_CENTER_Y] - radius, collector);
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] - radius + 1 + r, collector[COLLECTOR_CENTER_Y] + radius, collector);
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] - radius, collector[COLLECTOR_CENTER_Y] - radius + 1 + r, collector);
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] + radius, collector[COLLECTOR_CENTER_Y] - radius + 1 + r, collector);
                }
                if (radius > 1) {
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] - radius + 1, collector[COLLECTOR_CENTER_Y] - radius + 1, collector);
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] - radius + 1, collector[COLLECTOR_CENTER_Y] + radius - 1, collector);
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] + radius - 1, collector[COLLECTOR_CENTER_Y] - radius + 1, collector);
                    addPixelToCollector(collector[COLLECTOR_CENTER_X] + radius - 1, collector[COLLECTOR_CENTER_Y] + radius - 1, collector);
                }
            }
            else {
                addPixelToCollector(collector[COLLECTOR_CENTER_X], collector[COLLECTOR_CENTER_Y], collector);
            }
            // Keep it in the array if added at least one new pixel to the collector
            return addedAtLeastOne;
        });
        radius++;
    }
    // We want to have the collectors with the most points first
    // sort modifies in place, so collectors changes as a side effect (which we don't really care because we don't use it anymore)
    collectors
        .sort((a, b) => b[COLLECTOR_NEAREST].length - a[COLLECTOR_NEAREST].length)
        .map((collector) => {
        if (collector[COLLECTOR_MIN_X] < 1e9) {
            const shardWidth = collector[COLLECTOR_MAX_X] - collector[COLLECTOR_MIN_X] + 1;
            const shardHeight = collector[COLLECTOR_MAX_Y] - collector[COLLECTOR_MIN_Y] + 1;
            const [shardCanvas, shardCtx] = createOffscreenCanvas(shardWidth, shardHeight);
            const imgData = obtainImageData(shardCanvas);
            collector[COLLECTOR_NEAREST].map((point) => imgData.data.set(point[2], 4 *
                ((point[1] - collector[COLLECTOR_MIN_Y]) * shardWidth +
                    (point[0] - collector[COLLECTOR_MIN_X]))));
            shardCtx.putImageData(imgData, 0, 0);
            sprites.push([
                shardCanvas,
                collector[COLLECTOR_MIN_X],
                collector[COLLECTOR_MIN_Y],
            ]);
        }
    });
    return sprites;
}
