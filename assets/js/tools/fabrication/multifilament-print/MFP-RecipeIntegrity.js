/**
 * Canonical recipe identity and absolute-layer utilities for Multifilament Print.
 *
 * This module is intentionally independent of DOM and rendering code so the same
 * physical recipe representation can be used by STL, 3MF, vector and toolpath
 * exporters and verified in Node-based tests.
 */

export const RECIPE_SCHEMA_VERSION = '1.0.0';
export const SEQUENCE_MAP_SCHEMA_VERSION = '2.0.0';

function assertInteger(value, name, minimum = 0) {
    if (!Number.isInteger(value) || value < minimum) {
        throw new TypeError(`${name} must be an integer >= ${minimum}`);
    }
}

function assertFinitePositive(value, name) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new TypeError(`${name} must be a finite number > 0`);
    }
}

function normaliseNullableRevision(value) {
    if (value === undefined || value === null || value === '') return null;
    return String(value);
}

function materialIdentityForIndex(filamentIndex, filamentProfiles) {
    if (filamentIndex === 0) {
        return {
            filamentIndex: null,
            filamentRef: null,
            profileRevision: null
        };
    }

    const profile = filamentProfiles[filamentIndex - 1] || {};
    const filamentRef = profile.profileId
        ?? profile.profile_id
        ?? profile.materialProfileId
        ?? profile.material_profile_id
        ?? profile.id
        ?? profile.uid
        ?? profile.name
        ?? profile.n
        ?? `legacy-filament-${filamentIndex}`;

    const profileRevision = profile.profileRevision
        ?? profile.profile_revision
        ?? profile.revision
        ?? profile.version
        ?? null;

    return {
        filamentIndex,
        filamentRef: String(filamentRef),
        profileRevision: normaliseNullableRevision(profileRevision)
    };
}

/**
 * Preserve every absolute layer position, including internal and trailing empty
 * layers. A shorter legacy sequence may be padded, but an overlong sequence is
 * rejected rather than truncated.
 */
export function normaliseAbsoluteSequence(sequence, absoluteLayerCount = null) {
    if (sequence === null || sequence === undefined || typeof sequence[Symbol.iterator] !== 'function') {
        throw new TypeError('sequence must be an iterable of non-negative filament indices');
    }

    const source = Array.from(sequence, value => {
        const numeric = Number(value);
        assertInteger(numeric, 'sequence value', 0);
        return numeric;
    });

    const layerCount = absoluteLayerCount === null || absoluteLayerCount === undefined
        ? Math.max(source.length, 1)
        : Number(absoluteLayerCount);

    assertInteger(layerCount, 'absoluteLayerCount', 1);

    if (source.length > layerCount) {
        throw new RangeError(`sequence contains ${source.length} layers but absoluteLayerCount is ${layerCount}`);
    }

    return source.concat(Array(layerCount - source.length).fill(0));
}

/** Determine the physical layer span without counting only occupied layers. */
export function getAbsoluteLayerCount(palette, declaredLayerCount = null) {
    if (!Array.isArray(palette)) throw new TypeError('palette must be an array');

    let maximumSequenceLength = 0;
    for (const entry of palette) {
        if (entry?.sequence !== undefined && entry?.sequence !== null) {
            if (typeof entry.sequence[Symbol.iterator] !== 'function') {
                throw new TypeError('palette sequence must be iterable');
            }
            maximumSequenceLength = Math.max(maximumSequenceLength, Array.from(entry.sequence).length);
        }
    }

    if (declaredLayerCount !== null && declaredLayerCount !== undefined) {
        const declared = Number(declaredLayerCount);
        assertInteger(declared, 'declaredLayerCount', 1);
        if (declared < maximumSequenceLength) {
            throw new RangeError(
                `declaredLayerCount ${declared} is shorter than palette sequence length ${maximumSequenceLength}`
            );
        }
        return declared;
    }

    return Math.max(maximumSequenceLength, 1);
}

/**
 * Convert a legacy integer sequence into a condition-complete canonical recipe.
 * Array order is physical bottom-to-top order and is never sorted or compressed.
 */
export function createCanonicalRecipeRecord({
    sequence,
    layerCount = null,
    layerHeight = null,
    filamentProfiles = [],
    processProfileRevision = null,
    backingProfileRevision = null,
    viewingSide = 'front'
}) {
    if (!['front', 'rear'].includes(viewingSide)) {
        throw new TypeError("viewingSide must be 'front' or 'rear'");
    }
    if (!Array.isArray(filamentProfiles)) {
        throw new TypeError('filamentProfiles must be an array');
    }
    if (layerHeight !== null && layerHeight !== undefined) {
        assertFinitePositive(Number(layerHeight), 'layerHeight');
    }

    const absoluteSequence = normaliseAbsoluteSequence(sequence, layerCount);
    const normalisedLayerHeight = layerHeight === null || layerHeight === undefined
        ? null
        : Number(layerHeight);

    return {
        schemaVersion: RECIPE_SCHEMA_VERSION,
        viewingSide,
        processProfileRevision: normaliseNullableRevision(processProfileRevision),
        backingProfileRevision: normaliseNullableRevision(backingProfileRevision),
        layerCount: absoluteSequence.length,
        layerHeight: normalisedLayerHeight,
        layers: absoluteSequence.map((filamentIndex, position) => {
            const material = materialIdentityForIndex(filamentIndex, filamentProfiles);
            return {
                position,
                thickness: normalisedLayerHeight,
                intentionalEmpty: filamentIndex === 0,
                ...material
            };
        })
    };
}

function canonicaliseValue(value) {
    if (value === null) return null;
    if (Array.isArray(value)) return value.map(canonicaliseValue);
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) throw new TypeError('canonical data cannot contain non-finite numbers');
        return value;
    }
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            if (value[key] === undefined) {
                throw new TypeError(`canonical data cannot contain undefined at key ${key}`);
            }
            result[key] = canonicaliseValue(value[key]);
        }
        return result;
    }
    throw new TypeError(`unsupported canonical value type: ${typeof value}`);
}

/** Stable JSON: object keys sorted recursively; array order preserved exactly. */
export function stableStringify(value) {
    return JSON.stringify(canonicaliseValue(value));
}

export async function sha256Hex(text) {
    if (typeof text !== 'string') throw new TypeError('sha256Hex input must be a string');
    if (!globalThis.crypto?.subtle) {
        throw new Error('Web Crypto SHA-256 is unavailable in this environment');
    }

    const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createRecipeId(recipeRecord) {
    const digest = await sha256Hex(stableStringify(recipeRecord));
    return `mfp-recipe-sha256:${digest}`;
}

/** Build one auditable identity record for every palette entry. */
export async function createRecipeManifest(palette, {
    layerCount = null,
    layerHeight = null,
    filamentProfiles = [],
    processProfileRevision = null,
    backingProfileRevision = null,
    viewingSide = 'front'
} = {}) {
    const absoluteLayerCount = getAbsoluteLayerCount(palette, layerCount);
    const recipes = [];

    for (let paletteIndex = 0; paletteIndex < palette.length; paletteIndex++) {
        const entry = palette[paletteIndex];
        if (!entry?.sequence) {
            throw new TypeError(`palette entry ${paletteIndex} is missing sequence`);
        }

        const canonicalRecipe = createCanonicalRecipeRecord({
            sequence: entry.sequence,
            layerCount: absoluteLayerCount,
            layerHeight,
            filamentProfiles,
            processProfileRevision,
            backingProfileRevision,
            viewingSide
        });

        recipes.push({
            paletteIndex,
            recipeId: await createRecipeId(canonicalRecipe),
            absoluteSequence: normaliseAbsoluteSequence(entry.sequence, absoluteLayerCount),
            canonicalRecipe
        });
    }

    return {
        schemaVersion: RECIPE_SCHEMA_VERSION,
        generatedBy: 'MFP-RecipeIntegrity',
        layerCount: absoluteLayerCount,
        layerHeight: layerHeight === null || layerHeight === undefined ? null : Number(layerHeight),
        recipes
    };
}

/**
 * Expand palette assignments to physical absolute layers. Empty positions remain
 * represented by empty layer maps and therefore retain their z-offset.
 */
export function buildAbsoluteLayerMaps({
    map,
    width,
    height,
    palette,
    filamentCount,
    layerCount = null
}) {
    assertInteger(Number(width), 'width', 1);
    assertInteger(Number(height), 'height', 1);
    assertInteger(Number(filamentCount), 'filamentCount', 1);
    if (!map || typeof map[Symbol.iterator] !== 'function') {
        throw new TypeError('map must be an iterable of palette indices');
    }
    if (!Array.isArray(palette)) throw new TypeError('palette must be an array');

    const pixelMap = Array.from(map, Number);
    if (pixelMap.length !== width * height) {
        throw new RangeError(`map length ${pixelMap.length} does not equal width * height (${width * height})`);
    }

    const absoluteLayerCount = getAbsoluteLayerCount(palette, layerCount);
    const normalisedPalette = palette.map((entry, paletteIndex) => {
        if (!entry?.sequence) throw new TypeError(`palette entry ${paletteIndex} is missing sequence`);
        return normaliseAbsoluteSequence(entry.sequence, absoluteLayerCount);
    });

    const layerMaps = Array.from({ length: absoluteLayerCount }, () =>
        Array.from({ length: filamentCount }, () => new Set())
    );

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width + x;
            const paletteIndex = pixelMap[pixelIndex];
            assertInteger(paletteIndex, `map[${pixelIndex}]`, 0);
            if (paletteIndex >= normalisedPalette.length) {
                throw new RangeError(`map[${pixelIndex}] references missing palette entry ${paletteIndex}`);
            }

            const sequence = normalisedPalette[paletteIndex];
            for (let absoluteLayer = 0; absoluteLayer < absoluteLayerCount; absoluteLayer++) {
                const filamentReference = sequence[absoluteLayer];
                if (filamentReference === 0) continue;
                if (filamentReference > filamentCount) {
                    throw new RangeError(
                        `palette entry ${paletteIndex} layer ${absoluteLayer} references filament ${filamentReference}, ` +
                        `but filamentCount is ${filamentCount}`
                    );
                }
                layerMaps[absoluteLayer][filamentReference - 1].add(`${x},${y}`);
            }
        }
    }

    return layerMaps;
}

/** Plain-JSON project representation with exact absolute sequences retained. */
export function serializeQuantizedSequenceMap({
    width,
    height,
    map,
    palette,
    layerCount = null,
    recipeManifest = null
}) {
    const absoluteLayerCount = getAbsoluteLayerCount(palette, layerCount);
    const pixelMap = Array.from(map, Number);
    if (pixelMap.length !== width * height) {
        throw new RangeError('sequence map dimensions do not match map length');
    }

    return {
        schemaVersion: SEQUENCE_MAP_SCHEMA_VERSION,
        width: Number(width),
        height: Number(height),
        layerCount: absoluteLayerCount,
        map: pixelMap,
        palette: palette.map(entry => ({
            ...entry,
            sequence: normaliseAbsoluteSequence(entry.sequence, absoluteLayerCount)
        })),
        ...(recipeManifest ? { recipeManifest } : {})
    };
}

/** Accept current v2 records and legacy records that omitted schemaVersion/layerCount. */
export function deserializeQuantizedSequenceMap(data) {
    if (!data || typeof data !== 'object') throw new TypeError('sequence map data must be an object');
    const width = Number(data.width);
    const height = Number(data.height);
    assertInteger(width, 'width', 1);
    assertInteger(height, 'height', 1);
    if (!Array.isArray(data.palette)) throw new TypeError('sequence map palette must be an array');
    if (!Array.isArray(data.map) && !(data.map instanceof Uint16Array)) {
        throw new TypeError('sequence map map must be an array or Uint16Array');
    }

    const layerCount = getAbsoluteLayerCount(data.palette, data.layerCount ?? null);
    const serialised = serializeQuantizedSequenceMap({
        width,
        height,
        map: data.map,
        palette: data.palette,
        layerCount,
        recipeManifest: data.recipeManifest ?? null
    });

    return {
        schemaVersion: serialised.schemaVersion,
        width,
        height,
        layerCount,
        map: new Uint16Array(serialised.map),
        palette: serialised.palette,
        recipeManifest: serialised.recipeManifest ?? null
    };
}
