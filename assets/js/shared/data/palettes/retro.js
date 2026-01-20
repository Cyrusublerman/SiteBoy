/**
 * Retro Hardware Palettes
 * 
 * Authentic colour palettes from retro gaming consoles and computers.
 */

export const RETRO_PALETTES = {
    // ═══════════════════════════════════════════════════════════════════
    // GAMING CONSOLES
    // ═══════════════════════════════════════════════════════════════════
    
    'nes': {
        name: 'NES',
        colours: [
            '#7C7C7C', '#0000FC', '#0000BC', '#4428BC', 
            '#940084', '#A80020', '#A81000', '#881400', 
            '#503000', '#007800', '#006800', '#005800', 
            '#004058', '#000000', '#F8F8F8', '#FFFFFF'
        ],
        category: 'retro',
        description: 'Nintendo Entertainment System (1983)',
        source: 'Hardware Palette'
    },
    
    'gameboy': {
        name: 'Game Boy',
        colours: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
        category: 'retro',
        description: 'Original Game Boy LCD (1989)',
        source: 'Hardware Palette'
    },
    
    // ═══════════════════════════════════════════════════════════════════
    // PERSONAL COMPUTERS
    // ═══════════════════════════════════════════════════════════════════
    
    'cga-cyan-magenta': {
        name: 'CGA Cyan/Magenta',
        colours: ['#000000', '#00FFFF', '#FF00FF', '#FFFFFF'],
        category: 'retro',
        description: 'IBM CGA Palette 1 (1981)',
        source: 'Hardware Palette'
    },
    
    'cga-red-green': {
        name: 'CGA Red/Green',
        colours: ['#000000', '#FF5555', '#55FF55', '#FFFF55'],
        category: 'retro',
        description: 'IBM CGA Palette 2 (1981)',
        source: 'Hardware Palette'
    },
    
    'ega': {
        name: 'EGA',
        colours: [
            '#000000', '#0000AA', '#00AA00', '#00AAAA',
            '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
            '#555555', '#5555FF', '#55FF55', '#55FFFF',
            '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
        ],
        category: 'retro',
        description: 'IBM EGA (1984)',
        source: 'Hardware Palette'
    },
    
    'vga': {
        name: 'VGA',
        colours: [
            '#000000', '#800000', '#008000', '#808000',
            '#000080', '#800080', '#008080', '#C0C0C0',
            '#808080', '#FF0000', '#00FF00', '#FFFF00',
            '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'
        ],
        category: 'retro',
        description: 'IBM VGA (1987)',
        source: 'Hardware Palette'
    },
    
    'commodore-64': {
        name: 'Commodore 64',
        colours: [
            '#000000', '#FFFFFF', '#880000', '#AAFFEE',
            '#CC44CC', '#00CC55', '#0000AA', '#EEEE77',
            '#DD8855', '#664400', '#FF7777', '#333333',
            '#777777', '#AAFF66', '#0088FF', '#BBBBBB'
        ],
        category: 'retro',
        description: 'Commodore 64 (1982)',
        source: 'Hardware Palette'
    },
    
    'apple-ii': {
        name: 'Apple II',
        colours: [
            '#000000', '#901740', '#402CA5', '#D043E5',
            '#006940', '#808080', '#2F95E5', '#BFABF4',
            '#405400', '#D06A1A', '#808080', '#FFA8FA',
            '#1BD000', '#FFAF1A', '#6FE8BF', '#FFFFFF'
        ],
        category: 'retro',
        description: 'Apple II (1977)',
        source: 'Hardware Palette'
    },
    
    'zx-spectrum': {
        name: 'ZX Spectrum',
        colours: [
            '#000000', '#0000D7', '#D70000', '#D700D7',
            '#00D700', '#00D7D7', '#D7D700', '#D7D7D7',
            '#000000', '#0000FF', '#FF0000', '#FF00FF',
            '#00FF00', '#00FFFF', '#FFFF00', '#FFFFFF'
        ],
        category: 'retro',
        description: 'ZX Spectrum (1982)',
        source: 'Hardware Palette'
    },
    
    'pico-8': {
        name: 'Pico-8',
        colours: [
            '#000000', '#1D2B53', '#7E2553', '#008751',
            '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
            '#FF004D', '#FFA300', '#FFEC27', '#00E436',
            '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
        ],
        category: 'retro',
        description: 'Pico-8 Fantasy Console (2015)',
        source: 'Fantasy Console'
    }
};

export default RETRO_PALETTES;

