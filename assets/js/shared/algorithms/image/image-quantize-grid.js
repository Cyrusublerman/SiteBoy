/**
 * Global pixel grouping for downscaling by averaging.
 * 
 * @param {Uint8ClampedArray} data - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} group - Pixel group size (1..N)
 * @returns {Uint8ClampedArray} Quantized RGBA data (same size)
 */
export function quantizeByPixelGroup(data, width, height, group) {
    var size = Math.max(1, Math.floor(group || 1));
    if (size <= 1) return data;
    
    var result = new Uint8ClampedArray(data.length);
    
    for (var y = 0; y < height; y += size) {
        for (var x = 0; x < width; x += size) {
            var sumR = 0;
            var sumG = 0;
            var sumB = 0;
            var sumA = 0;
            var count = 0;
            
            var yMax = Math.min(height, y + size);
            var xMax = Math.min(width, x + size);
            
            for (var yy = y; yy < yMax; yy++) {
                for (var xx = x; xx < xMax; xx++) {
                    var idx = (yy * width + xx) * 4;
                    sumR += data[idx];
                    sumG += data[idx + 1];
                    sumB += data[idx + 2];
                    sumA += data[idx + 3];
                    count++;
                }
            }
            
            var avgR = Math.round(sumR / count);
            var avgG = Math.round(sumG / count);
            var avgB = Math.round(sumB / count);
            var avgA = Math.round(sumA / count);
            
            for (var yyy = y; yyy < yMax; yyy++) {
                for (var xxx = x; xxx < xMax; xxx++) {
                    var outIdx = (yyy * width + xxx) * 4;
                    result[outIdx] = avgR;
                    result[outIdx + 1] = avgG;
                    result[outIdx + 2] = avgB;
                    result[outIdx + 3] = avgA;
                }
            }
        }
    }
    
    return result;
}

