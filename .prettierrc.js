module.exports = {
  // Core formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  
  // HTML formatting (for component files)
  htmlWhitespaceSensitivity: 'css',
  
  // CSS formatting
  cssDeclarationSorterOrder: 'alphabetical',
  
  // File overrides for specific SiteBoy needs
  overrides: [
    {
      files: '*.html',
      options: {
        printWidth: 120, // Longer lines for HTML
        htmlWhitespaceSensitivity: 'ignore'
      }
    },
    {
      files: '*.css',
      options: {
        printWidth: 80, // Shorter for CSS readability
        singleQuote: false // CSS prefers double quotes
      }
    },
    {
      files: ['*.md', '*.markdown'],
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    }
  ]
}; 