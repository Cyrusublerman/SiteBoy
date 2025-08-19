module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Code quality
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    
    // Style consistency
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Best practices for web development
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-shadow': 'warn',
    
    // SiteBoy specific (VGA/retro development)
    'camelcase': 'off', // Allow snake_case for VGA compatibility
    'max-len': ['warn', { code: 120 }] // Reasonable line length
  },
  globals: {
    // SiteBoy globals
    'Site': 'readonly',
    'TypoGrid': 'readonly',
    'FontComparison': 'readonly',
    'ColourArray': 'readonly'
  },
  ignorePatterns: [
    'dist/',
    'reference/',
    'node_modules/',
    '*.min.js'
  ]
}; 