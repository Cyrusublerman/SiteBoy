/**
 * Grid CSV Parser
 * 
 * Parses calibration grid CSV files back into configuration objects.
 * Enables resuming scan analysis sessions by importing grid data.
 * 
 * CSV Format Expected:
 * Index,Sequence,Expected RGB,Row,Col,Filament Names
 * 0,"[1,2,0,0]","rgb(255,120,80)",0,0,"Cyan, Yellow"
 * 
 * @module grid-csv-parser
 */

/**
 * Parse grid CSV content into configuration object
 * 
 * @param {string} csvContent - Raw CSV text content
 * @returns {Object} Grid configuration object
 * @throws {Error} If CSV format is invalid
 */
export function parseGridCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
        throw new Error('CSV file is empty or missing header');
    }
    
    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Index', 'Sequence', 'Expected RGB', 'Row', 'Col', 'Filament Names'];
    
    // Validate header
    const hasValidHeader = expectedHeaders.every(h => header.includes(h));
    if (!hasValidHeader) {
        throw new Error(`Invalid CSV header. Expected: ${expectedHeaders.join(', ')}`);
    }
    
    // Get column indices
    const colIndex = header.indexOf('Index');
    const colSequence = header.indexOf('Sequence');
    const colRGB = header.indexOf('Expected RGB');
    const colRow = header.indexOf('Row');
    const colCol = header.indexOf('Col');
    const colFilaments = header.indexOf('Filament Names');
    
    // Parse data rows
    const tiles = [];
    const sequencesSet = new Set();
    const filamentNamesSet = new Set();
    let maxRow = 0;
    let maxCol = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        // Parse CSV line (handle quoted fields)
        const fields = parseCSVLine(line);
        
        if (fields.length < expectedHeaders.length) {
            console.warn(`Skipping malformed line ${i + 1}: ${line}`);
            continue;
        }
        
        const index = parseInt(fields[colIndex]);
        const sequenceStr = fields[colSequence].replace(/"/g, '');
        const sequence = JSON.parse(sequenceStr);
        const rgbStr = fields[colRGB].replace(/"/g, '');
        const rgb = parseRGBString(rgbStr);
        const row = parseInt(fields[colRow]);
        const col = parseInt(fields[colCol]);
        const filamentNames = fields[colFilaments].replace(/"/g, '').split(',').map(n => n.trim());
        
        tiles.push({
            index,
            sequence,
            expectedRGB: rgb,
            row,
            col,
            filamentNames
        });
        
        sequencesSet.add(JSON.stringify(sequence));
        filamentNames.forEach(name => filamentNamesSet.add(name));
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
    }
    
    // Sort tiles by index
    tiles.sort((a, b) => a.index - b.index);
    
    // Extract unique sequences
    const sequences = tiles.map(t => t.sequence);
    
    // Build filament color list (order matters!)
    // We need to preserve the original order from the first tile
    const filamentNames = [...filamentNamesSet];
    const colours = filamentNames.map(name => ({
        n: name,
        h: '#808080' // Placeholder - actual hex not stored in CSV
    }));
    
    // Detect empty cells (missing indices)
    const emptyCells = [];
    const rows = maxRow + 1;
    const cols = maxCol + 1;
    const totalCells = rows * cols;
    const presentIndices = new Set(tiles.map(t => t.index));
    
    for (let i = 0; i < totalCells; i++) {
        if (!presentIndices.has(i)) {
            emptyCells.push(i);
        }
    }
    
    // Calculate grid dimensions (we need to guess these from the data)
    // In the CSV, we don't have explicit tileSize, gap, etc.
    // We'll use defaults and let the user adjust via transform
    const layerCount = sequences[0]?.length || 4;
    
    return {
        sequences,
        colours,
        rows,
        cols,
        tileSize: 10,        // Default, user can adjust via overlay scale
        gap: 1,              // Default
        width: cols * 11,    // Estimated (tileSize + gap)
        height: rows * 11,   // Estimated
        layerCount,
        baseLayers: 3,       // Default
        emptyCells: emptyCells.length > 0 ? emptyCells : undefined,
        tiles  // Include full tile data for sequence lookup
    };
}

/**
 * Parse a CSV line handling quoted fields with commas
 * 
 * @param {string} line - Single CSV line
 * @returns {Array<string>} Parsed fields
 */
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    fields.push(current.trim());
    return fields;
}

/**
 * Parse RGB string to object
 * Handles formats: "rgb(255,120,80)" or "#FF7850"
 * 
 * @param {string} rgbStr - RGB string
 * @returns {Object} {r, g, b}
 */
function parseRGBString(rgbStr) {
    if (rgbStr.startsWith('#')) {
        // Hex format
        const hex = rgbStr.slice(1);
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    } else if (rgbStr.startsWith('rgb')) {
        // rgb(r,g,b) format
        const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
    }
    
    throw new Error(`Invalid RGB string: ${rgbStr}`);
}

/**
 * Validate grid configuration object
 * 
 * @param {Object} gridConfig - Configuration to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateGridConfig(gridConfig) {
    const required = ['sequences', 'colours', 'rows', 'cols', 'layerCount'];
    
    for (const field of required) {
        if (!(field in gridConfig)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    if (gridConfig.sequences.length === 0) {
        throw new Error('Grid has no sequences');
    }
    
    if (gridConfig.colours.length < 2) {
        throw new Error('Grid must have at least 2 filaments');
    }
    
    if (gridConfig.rows < 1 || gridConfig.cols < 1) {
        throw new Error('Grid must have at least 1 row and 1 column');
    }
    
    return true;
}

