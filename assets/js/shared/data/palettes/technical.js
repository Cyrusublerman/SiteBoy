/**
 * Technical Palettes
 * 
 * Algorithmically-generated and bit-depth quantized palettes.
 */

export const TECHNICAL_PALETTES = {
    // ═══════════════════════════════════════════════════════════════════
    // BIT-DEPTH QUANTIZED
    // ═══════════════════════════════════════════════════════════════════
    
    '1-bit': {
        name: '1-bit',
        colours: ['#000000', '#FFFFFF'],
        category: 'technical',
        description: 'Pure black and white (2 colours)'
    },
    
    '2-bit': {
        name: '2-bit',
        colours: ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],
        category: 'technical',
        description: 'Four grey levels (4 colours)'
    },
    
    '3-bit': {
        name: '3-bit',
        colours: ['#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'],
        category: 'technical',
        description: 'RGB primaries (8 colours)'
    },
    
    '3-bit-grey': {
        name: '3-bit Grey',
        colours: ['#000000', '#242424', '#484848', '#6C6C6C', '#909090', '#B4B4B4', '#D8D8D8', '#FFFFFF'],
        category: 'technical',
        description: 'Eight grey shades (8 colours)'
    },
    
    // ═══════════════════════════════════════════════════════════════════
    // PRIMARIES & SIMPLE
    // ═══════════════════════════════════════════════════════════════════
    
    'primaries': {
        name: 'Primaries',
        colours: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
        category: 'technical',
        description: 'Pure RGB primaries with black/white (5 colours)'
    },
    
    'pastel': {
        name: 'Pastel',
        colours: ['#FFC0CB', '#E6E6FA', '#ADD8E6', '#98FF98', '#FFFFE0', '#FFDAB9'],
        category: 'technical',
        description: 'Soft pastel colours (6 colours)'
    }
};

export default TECHNICAL_PALETTES;

