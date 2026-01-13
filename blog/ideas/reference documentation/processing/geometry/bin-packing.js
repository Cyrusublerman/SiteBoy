/**
 * @fileoverview Rectangle Bin Packing Algorithms
 * 
 * Algorithms for packing rectangles into containers.
 * All functions are pure and stateless.
 * 
 * @module geometry/bin-packing
 */

// ═══════════════════════════════════════════════════════════════════════════
// MAXRECTS ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} Rect
 * @property {number} id - Unique identifier
 * @property {number} width - Rectangle width
 * @property {number} height - Rectangle height
 * @property {number} [x] - Placed X position
 * @property {number} [y] - Placed Y position
 * @property {boolean} [rotated] - Whether rotated 90°
 */

/**
 * @typedef {Object} FreeRect
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Width
 * @property {number} height - Height
 */

/**
 * MaxRects bin packer
 * 
 * @param {number} binWidth - Container width
 * @param {number} binHeight - Container height
 * @param {Rect[]} rects - Rectangles to pack
 * @param {Object} [options] - Packing options
 * @param {boolean} [options.allowRotation=false] - Allow 90° rotation
 * @param {string} [options.heuristic='bestShortSide'] - Placement heuristic
 * @returns {{packed: Rect[], unpacked: Rect[], efficiency: number}}
 */
export function maxRectsPack(binWidth, binHeight, rects, options = {}) {
    const {
        allowRotation = false,
        heuristic = 'bestShortSide'
    } = options;
    
    // Sort by area (largest first) for better packing
    const sorted = [...rects].sort((a, b) => 
        (b.width * b.height) - (a.width * a.height)
    );
    
    // Initialize free rectangles list with entire bin
    let freeRects = [{ x: 0, y: 0, width: binWidth, height: binHeight }];
    
    const packed = [];
    const unpacked = [];
    
    for (const rect of sorted) {
        const placement = findBestPlacement(
            freeRects, rect.width, rect.height, 
            heuristic, allowRotation
        );
        
        if (placement) {
            const placedRect = {
                ...rect,
                x: placement.x,
                y: placement.y,
                rotated: placement.rotated
            };
            if (placement.rotated) {
                placedRect.width = rect.height;
                placedRect.height = rect.width;
            }
            packed.push(placedRect);
            
            // Split free rectangles
            freeRects = splitFreeRects(freeRects, placedRect);
            freeRects = pruneFreeRects(freeRects);
        } else {
            unpacked.push(rect);
        }
    }
    
    // Calculate efficiency
    const packedArea = packed.reduce((sum, r) => sum + r.width * r.height, 0);
    const efficiency = packedArea / (binWidth * binHeight);
    
    return { packed, unpacked, efficiency };
}

/**
 * Find best placement for rectangle
 * 
 * @param {FreeRect[]} freeRects - Available free rectangles
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {string} heuristic - Placement heuristic
 * @param {boolean} allowRotation - Allow rotation
 * @returns {{x: number, y: number, rotated: boolean}|null}
 */
function findBestPlacement(freeRects, width, height, heuristic, allowRotation) {
    let bestScore = Infinity;
    let bestX = 0, bestY = 0, bestRotated = false;
    let found = false;
    
    for (const freeRect of freeRects) {
        // Try normal orientation
        if (width <= freeRect.width && height <= freeRect.height) {
            const score = scoreRect(freeRect, width, height, heuristic);
            if (score < bestScore) {
                bestScore = score;
                bestX = freeRect.x;
                bestY = freeRect.y;
                bestRotated = false;
                found = true;
            }
        }
        
        // Try rotated orientation
        if (allowRotation && height <= freeRect.width && width <= freeRect.height) {
            const score = scoreRect(freeRect, height, width, heuristic);
            if (score < bestScore) {
                bestScore = score;
                bestX = freeRect.x;
                bestY = freeRect.y;
                bestRotated = true;
                found = true;
            }
        }
    }
    
    return found ? { x: bestX, y: bestY, rotated: bestRotated } : null;
}

/**
 * Score a potential placement
 * 
 * @param {FreeRect} freeRect - Free rectangle
 * @param {number} width - Placed width
 * @param {number} height - Placed height
 * @param {string} heuristic - Scoring heuristic
 * @returns {number} Score (lower is better)
 */
function scoreRect(freeRect, width, height, heuristic) {
    const leftoverX = freeRect.width - width;
    const leftoverY = freeRect.height - height;
    
    switch (heuristic) {
        case 'bestShortSide':
            return Math.min(leftoverX, leftoverY);
        case 'bestLongSide':
            return Math.max(leftoverX, leftoverY);
        case 'bestArea':
            return leftoverX * leftoverY;
        case 'bottomLeft':
            return freeRect.y * 10000 + freeRect.x;
        default:
            return Math.min(leftoverX, leftoverY);
    }
}

/**
 * Split free rectangles after placing a rect
 * 
 * @param {FreeRect[]} freeRects - Current free rectangles
 * @param {Rect} placedRect - Placed rectangle
 * @returns {FreeRect[]} Updated free rectangles
 */
function splitFreeRects(freeRects, placedRect) {
    const newFreeRects = [];
    
    for (const freeRect of freeRects) {
        // Check if placed rect intersects this free rect
        if (!rectsIntersect(freeRect, placedRect)) {
            newFreeRects.push(freeRect);
            continue;
        }
        
        // Split into up to 4 new free rects
        // Left of placed
        if (placedRect.x > freeRect.x) {
            newFreeRects.push({
                x: freeRect.x,
                y: freeRect.y,
                width: placedRect.x - freeRect.x,
                height: freeRect.height
            });
        }
        
        // Right of placed
        if (placedRect.x + placedRect.width < freeRect.x + freeRect.width) {
            newFreeRects.push({
                x: placedRect.x + placedRect.width,
                y: freeRect.y,
                width: freeRect.x + freeRect.width - placedRect.x - placedRect.width,
                height: freeRect.height
            });
        }
        
        // Above placed
        if (placedRect.y > freeRect.y) {
            newFreeRects.push({
                x: freeRect.x,
                y: freeRect.y,
                width: freeRect.width,
                height: placedRect.y - freeRect.y
            });
        }
        
        // Below placed
        if (placedRect.y + placedRect.height < freeRect.y + freeRect.height) {
            newFreeRects.push({
                x: freeRect.x,
                y: placedRect.y + placedRect.height,
                width: freeRect.width,
                height: freeRect.y + freeRect.height - placedRect.y - placedRect.height
            });
        }
    }
    
    return newFreeRects;
}

/**
 * Remove redundant (fully contained) free rectangles
 * 
 * @param {FreeRect[]} freeRects - Free rectangles
 * @returns {FreeRect[]} Pruned list
 */
function pruneFreeRects(freeRects) {
    const result = [];
    
    for (let i = 0; i < freeRects.length; i++) {
        let contained = false;
        
        for (let j = 0; j < freeRects.length; j++) {
            if (i !== j && rectContains(freeRects[j], freeRects[i])) {
                contained = true;
                break;
            }
        }
        
        if (!contained) {
            result.push(freeRects[i]);
        }
    }
    
    return result;
}

/**
 * Check if two rectangles intersect
 * 
 * @param {FreeRect} a - First rectangle
 * @param {Rect} b - Second rectangle
 * @returns {boolean} True if intersecting
 */
function rectsIntersect(a, b) {
    return !(a.x >= b.x + b.width ||
             a.x + a.width <= b.x ||
             a.y >= b.y + b.height ||
             a.y + a.height <= b.y);
}

/**
 * Check if rect A fully contains rect B
 * 
 * @param {FreeRect} a - Outer rectangle
 * @param {FreeRect} b - Inner rectangle
 * @returns {boolean} True if A contains B
 */
function rectContains(a, b) {
    return a.x <= b.x &&
           a.y <= b.y &&
           a.x + a.width >= b.x + b.width &&
           a.y + a.height >= b.y + b.height;
}

// ═══════════════════════════════════════════════════════════════════════════
// SHELF ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple shelf packing algorithm
 * 
 * @param {number} binWidth - Container width
 * @param {number} binHeight - Container height
 * @param {Rect[]} rects - Rectangles to pack
 * @param {Object} [options] - Packing options
 * @returns {{packed: Rect[], unpacked: Rect[], efficiency: number}}
 */
export function shelfPack(binWidth, binHeight, rects, options = {}) {
    // Sort by height (tallest first)
    const sorted = [...rects].sort((a, b) => b.height - a.height);
    
    const shelves = [];
    const packed = [];
    const unpacked = [];
    
    for (const rect of sorted) {
        let placed = false;
        
        // Try to fit in existing shelf
        for (const shelf of shelves) {
            if (shelf.remainingWidth >= rect.width && shelf.height >= rect.height) {
                packed.push({
                    ...rect,
                    x: shelf.x + shelf.usedWidth,
                    y: shelf.y
                });
                shelf.usedWidth += rect.width;
                shelf.remainingWidth -= rect.width;
                placed = true;
                break;
            }
        }
        
        // Create new shelf if needed
        if (!placed) {
            const shelfY = shelves.length === 0 ? 0 :
                shelves[shelves.length - 1].y + shelves[shelves.length - 1].height;
            
            if (shelfY + rect.height <= binHeight && rect.width <= binWidth) {
                shelves.push({
                    x: 0,
                    y: shelfY,
                    height: rect.height,
                    usedWidth: rect.width,
                    remainingWidth: binWidth - rect.width
                });
                
                packed.push({
                    ...rect,
                    x: 0,
                    y: shelfY
                });
            } else {
                unpacked.push(rect);
            }
        }
    }
    
    const packedArea = packed.reduce((sum, r) => sum + r.width * r.height, 0);
    const efficiency = packedArea / (binWidth * binHeight);
    
    return { packed, unpacked, efficiency };
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-BIN PACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pack rectangles across multiple bins
 * 
 * @param {number} binWidth - Container width
 * @param {number} binHeight - Container height
 * @param {Rect[]} rects - Rectangles to pack
 * @param {Object} [options] - Packing options
 * @returns {{bins: Array<{packed: Rect[], efficiency: number}>, totalBins: number}}
 */
export function multiBinPack(binWidth, binHeight, rects, options = {}) {
    const bins = [];
    let remaining = [...rects];
    
    while (remaining.length > 0) {
        const result = maxRectsPack(binWidth, binHeight, remaining, options);
        bins.push({
            packed: result.packed,
            efficiency: result.efficiency
        });
        
        if (result.unpacked.length === remaining.length) {
            // No progress - some rects don't fit
            break;
        }
        
        remaining = result.unpacked;
    }
    
    return {
        bins,
        totalBins: bins.length,
        unpacked: remaining
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate total area of rectangles
 * 
 * @param {Rect[]} rects - Rectangles
 * @returns {number} Total area
 */
export function totalArea(rects) {
    return rects.reduce((sum, r) => sum + r.width * r.height, 0);
}

/**
 * Estimate minimum bins needed
 * 
 * @param {number} binWidth - Container width
 * @param {number} binHeight - Container height
 * @param {Rect[]} rects - Rectangles
 * @returns {number} Minimum bins (area-based lower bound)
 */
export function estimateMinBins(binWidth, binHeight, rects) {
    const binArea = binWidth * binHeight;
    const rectArea = totalArea(rects);
    return Math.ceil(rectArea / binArea);
}

