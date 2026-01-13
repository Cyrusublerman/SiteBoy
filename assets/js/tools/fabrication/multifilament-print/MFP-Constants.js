/**
 * Shared constants for Multifilament Print Tool
 */

// Bambu Lab PLA Basic - 29 Colors
export const FILAMENT_COLOURS = [
    {h:"#FFFFFF",n:"Jade White"},
    {h:"#EC008C",n:"Magenta"},
    {h:"#E4BD68",n:"Gold"},
    {h:"#3F8E43",n:"Mistletoe Green"},
    {h:"#C12E1F",n:"Red"},
    {h:"#5E43B7",n:"Purple"},
    {h:"#F7E6DE",n:"Beige"},
    {h:"#F55A74",n:"Pink"},
    {h:"#FEC600",n:"Sunflower Yellow"},
    {h:"#847D48",n:"Bronze"},
    {h:"#00B1B7",n:"Turquoise"},
    {h:"#482960",n:"Indigo Purple"},
    {h:"#D1D3D5",n:"Light Gray"},
    {h:"#F5547C",n:"Hot Pink"},
    {h:"#F4EE2A",n:"Yellow"},
    {h:"#6F5034",n:"Cocoa Brown"},
    {h:"#0086D6",n:"Cyan"},
    {h:"#5B6579",n:"Blue Grey"},
    {h:"#A6A9AA",n:"Silver"},
    {h:"#FF6A13",n:"Orange"},
    {h:"#BECF00",n:"Bright Green"},
    {h:"#9D432C",n:"Brown"},
    {h:"#0A2989",n:"Blue"},
    {h:"#545454",n:"Dark Gray"},
    {h:"#8E9089",n:"Gray"},
    {h:"#FF9016",n:"Pumpkin Orange"},
    {h:"#00AE42",n:"Bambu Green"},
    {h:"#9D2235",n:"Maroon Red"},
    {h:"#0056B8",n:"Cobalt Blue"},
    {h:"#000000",n:"Black"}
];

// VGA Color Palette for Grid Rendering (16 colors)
export const VGA_PALETTE = [
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
];

// Project version
export const PROJECT_VERSION = '1.2.0';

// File size limits
export const MAX_IMAGE_SIZE = 4096; // px
export const MAX_GRID_CELLS = 10000;

// Default settings
export const DEFAULTS = {
    bedWidth: 256,
    bedHeight: 256,
    scanWidth: 210,
    scanHeight: 297,
    tileSize: 10,
    gap: 1,
    layerCount: 6,
    baseLayers: 3,
    topLayers: 0,
    layerHeight: 0.08,
    sortMethod: 'Layer Count',
    perimeterMargin: 0,
    deadzonePercent: 10
};

