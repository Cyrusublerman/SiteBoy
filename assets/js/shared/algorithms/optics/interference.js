/**
 * @fileoverview Optical Interference and Thin-Film Effects
 * 
 * Functions for generating interference patterns and spectral colors.
 * All functions are pure and stateless.
 * 
 * @module optics/interference
 */

// ═══════════════════════════════════════════════════════════════════════════
// OPTICAL PATH DIFFERENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Optical path length
 * 
 * @param {number} geometricPath - Physical path length
 * @param {number} refractiveIndex - Medium refractive index
 * @returns {number} Optical path length
 */
export function opticalPathLength(geometricPath, refractiveIndex) {
    return geometricPath * refractiveIndex;
}

/**
 * Phase from optical path difference
 * 
 * @param {number} opd - Optical path difference
 * @param {number} wavelength - Light wavelength (same units as opd)
 * @returns {number} Phase in radians
 */
export function opdToPhase(opd, wavelength) {
    return (2 * Math.PI * opd) / wavelength;
}

/**
 * Two-beam interference intensity
 * 
 * @param {number} i1 - Intensity of beam 1
 * @param {number} i2 - Intensity of beam 2
 * @param {number} phaseDiff - Phase difference in radians
 * @returns {number} Resultant intensity
 */
export function twoBeamInterference(i1, i2, phaseDiff) {
    return i1 + i2 + 2 * Math.sqrt(i1 * i2) * Math.cos(phaseDiff);
}

// ═══════════════════════════════════════════════════════════════════════════
// THIN-FILM INTERFERENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Thin-film OPD for normal incidence
 * 
 * @param {number} thickness - Film thickness
 * @param {number} n - Film refractive index
 * @returns {number} Optical path difference
 */
export function thinFilmOPD(thickness, n) {
    return 2 * n * thickness;
}

/**
 * Thin-film OPD with angle
 * 
 * @param {number} thickness - Film thickness
 * @param {number} n - Film refractive index
 * @param {number} thetaT - Angle of refraction inside film (radians)
 * @returns {number} Optical path difference
 */
export function thinFilmOPDAngle(thickness, n, thetaT) {
    return 2 * n * thickness * Math.cos(thetaT);
}

/**
 * Thin-film reflection intensity (simple model)
 * 
 * @param {number} opd - Optical path difference
 * @param {number} wavelength - Light wavelength
 * @param {boolean} phaseShift - Include π phase shift (n1 < n_film)
 * @returns {number} Reflectance intensity [0, 1]
 */
export function thinFilmReflectance(opd, wavelength, phaseShift = true) {
    const phase = opdToPhase(opd, wavelength);
    const totalPhase = phaseShift ? phase + Math.PI : phase;
    // Simplified: assumes equal amplitude reflections
    return Math.sin(totalPhase / 2) ** 2;
}

/**
 * Spectral thin-film color
 *
 * @source blog/ideas/reference documentation/19_Interference_Optics/Thin-film_interference.md
 * @wikipedia https://en.wikipedia.org/wiki/Thin-film_interference
 * @section Thin-film interference
 * @formula R(\lambda) = 4R \sin^2(\delta/2) where \delta = 4\pi n d / \lambda
 *
 * @param {number} thickness - Film thickness (nm)
 * @param {number} n - Film refractive index
 * @param {Object} [options] - Options
 * @param {boolean} [options.phaseShift=true] - Include phase shift
 * @returns {{r: number, g: number, b: number}} RGB color [0, 1]
 */
export function thinFilmColor(thickness, n, options = {}) {
    const { phaseShift = true } = options;
    const opd = thinFilmOPD(thickness, n);
    
    let r = 0, g = 0, b = 0;
    let totalWeight = 0;
    
    // Integrate over visible spectrum
    for (let lambda = 380; lambda <= 780; lambda += 5) {
        const intensity = thinFilmReflectance(opd, lambda, phaseShift);
        const rgb = wavelengthToRGB(lambda);
        const weight = 1.0; // Could use CIE functions for better accuracy
        
        r += rgb.r * intensity * weight;
        g += rgb.g * intensity * weight;
        b += rgb.b * intensity * weight;
        totalWeight += weight;
    }
    
    // Normalize
    r /= totalWeight;
    g /= totalWeight;
    b /= totalWeight;
    
    return { r, g, b };
}

// ═══════════════════════════════════════════════════════════════════════════
// BIREFRINGENCE & CONOSCOPY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Birefringent retardation
 * 
 * @param {number} thickness - Crystal thickness
 * @param {number} no - Ordinary refractive index
 * @param {number} ne - Extraordinary refractive index
 * @param {number} wavelength - Light wavelength
 * @returns {number} Retardation in radians
 */
export function birefringentRetardation(thickness, no, ne, wavelength) {
    return (2 * Math.PI * thickness * Math.abs(ne - no)) / wavelength;
}

/**
 * Intensity between crossed polarizers with retarder
 * 
 * @param {number} retardation - Retardation in radians
 * @param {number} azimuth - Angle of crystal axis from polarizer (radians)
 * @returns {number} Transmitted intensity [0, 1]
 */
export function crossedPolarIntensity(retardation, azimuth) {
    return Math.sin(2 * azimuth) ** 2 * Math.sin(retardation / 2) ** 2;
}

/**
 * Uniaxial crystal interference figure (conoscopy)
 * 
 * @param {number} x - Normalized x coordinate [-1, 1]
 * @param {number} y - Normalized y coordinate [-1, 1]
 * @param {number} thickness - Crystal thickness
 * @param {number} no - Ordinary index
 * @param {number} ne - Extraordinary index
 * @param {number} wavelength - Light wavelength
 * @returns {{intensity: number, isIsogyre: boolean}} Interference figure data
 */
export function uniaxialConoscopy(x, y, thickness, no, ne, wavelength) {
    const r = Math.sqrt(x * x + y * y);
    const phi = Math.atan2(y, x);
    
    // Simplified model: r represents angle from optic axis
    const theta = r * 0.5; // Scale factor for viewing angle
    
    // Retardation increases with angle from optic axis
    const biref = Math.abs(ne - no);
    const retardation = (2 * Math.PI * thickness * biref * Math.sin(theta) ** 2) / wavelength;
    
    // Azimuth of vibration direction
    const azimuth = phi;
    
    // Intensity formula for crossed polars
    const intensity = Math.sin(2 * azimuth) ** 2 * Math.sin(retardation / 2) ** 2;
    
    // Isogyres: where sin(2φ) ≈ 0
    const isIsogyre = Math.abs(Math.sin(2 * phi)) < 0.1;
    
    return { intensity, isIsogyre };
}

/**
 * Spectral interference figure color
 * 
 * @param {number} x - Normalized x coordinate [-1, 1]
 * @param {number} y - Normalized y coordinate [-1, 1]
 * @param {number} thickness - Crystal thickness (nm)
 * @param {number} no - Ordinary index
 * @param {number} ne - Extraordinary index
 * @returns {{r: number, g: number, b: number}} RGB color [0, 1]
 */
export function conoscopicColor(x, y, thickness, no, ne) {
    let r = 0, g = 0, b = 0;
    
    for (let lambda = 400; lambda <= 700; lambda += 10) {
        const { intensity, isIsogyre } = uniaxialConoscopy(x, y, thickness, no, ne, lambda);
        const rgb = wavelengthToRGB(lambda);
        
        const i = isIsogyre ? 0 : intensity;
        r += rgb.r * i;
        g += rgb.g * i;
        b += rgb.b * i;
    }
    
    // Normalize
    const maxVal = Math.max(r, g, b, 0.001);
    return { r: r / maxVal, g: g / maxVal, b: b / maxVal };
}

// ═══════════════════════════════════════════════════════════════════════════
// WAVELENGTH TO RGB CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert wavelength to RGB (approximate)
 * 
 * Based on Dan Bruton's algorithm
 * 
 * @param {number} wavelength - Wavelength in nm (380-780)
 * @returns {{r: number, g: number, b: number}} RGB values [0, 1]
 */
export function wavelengthToRGB(wavelength) {
    let r, g, b;
    
    if (wavelength >= 380 && wavelength < 440) {
        r = -(wavelength - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
        r = 0;
        g = (wavelength - 440) / (490 - 440);
        b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
        r = 0;
        g = 1;
        b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
        r = 1;
        g = -(wavelength - 645) / (645 - 580);
        b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = 0;
        g = 0;
        b = 0;
    }
    
    // Intensity falloff at spectrum edges
    let intensity;
    if (wavelength >= 380 && wavelength < 420) {
        intensity = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if (wavelength >= 420 && wavelength <= 700) {
        intensity = 1;
    } else if (wavelength > 700 && wavelength <= 780) {
        intensity = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    } else {
        intensity = 0;
    }
    
    return {
        r: r * intensity,
        g: g * intensity,
        b: b * intensity
    };
}

/**
 * Retardation to Michel-Levy chart color (approximate)
 * 
 * @param {number} retardation - Retardation in nm
 * @returns {{r: number, g: number, b: number}} RGB color [0, 1]
 */
export function retardationToMichelLevy(retardation) {
    // Simplified: treats retardation as dominant wavelength subtracted
    const orders = retardation / 550; // ~550nm is green
    const fractionalOrder = orders % 1;
    
    // Map to spectral color
    const effectiveWavelength = 380 + fractionalOrder * 400;
    return wavelengthToRGB(effectiveWavelength);
}

