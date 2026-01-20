/**
 * Flow Matching Modes for ASCII Art
 * 
 * Calculates orientation cost based on different flow interpretations.
 */

/**
 * Match character stroke direction to tile edge direction.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Angle
 * @formula C = |theta_char - theta_tile| / pi
 */
export function calculateStrokeOrientationCost(charOrientation, tileOrientation) {
    var diff = Math.abs(charOrientation - tileOrientation);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff / Math.PI;
}

/**
 * Match character stroke parallel to gradient direction.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Angle
 * @formula C = |theta_char - theta_grad| / pi
 */
export function calculateParallelOrientationCost(charOrientation, gradientDirection) {
    var diff = Math.abs(charOrientation - gradientDirection);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff / Math.PI;
}

/**
 * Match character stroke perpendicular to gradient direction.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Angle
 * @formula C = |theta_char - (theta_grad + pi/2)| / pi
 */
export function calculatePerpendicularOrientationCost(charOrientation, gradientDirection) {
    var perpendicular = gradientDirection + Math.PI / 2;
    if (perpendicular > Math.PI) perpendicular -= 2 * Math.PI;
    var diff = Math.abs(charOrientation - perpendicular);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff / Math.PI;
}

/**
 * Calculate orientation cost by mode.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Angle
 * @formula C = mode(theta_char, theta_tile)
 */
export function calculateOrientationCostWithMode(charOrientation, tileMetrics, mode) {
    if (charOrientation === undefined || tileMetrics.orientation === undefined) return 0;
    
    switch (mode) {
        case 'Character Stroke (Edges)':
            return calculateStrokeOrientationCost(charOrientation, tileMetrics.orientation);
        case 'Gradient Parallel (Extrusion)':
            return calculateParallelOrientationCost(charOrientation, tileMetrics.orientation);
        case 'Gradient Perpendicular (Contour)':
            return calculatePerpendicularOrientationCost(charOrientation, tileMetrics.orientation);
        case 'Ignore':
            return 0;
        default:
            return calculatePerpendicularOrientationCost(charOrientation, tileMetrics.orientation);
    }
}

