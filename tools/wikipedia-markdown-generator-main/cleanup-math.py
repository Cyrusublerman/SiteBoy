#!/usr/bin/env python3
"""Clean up broken MathML in downloaded Wikipedia markdown files.

Converts garbage MathML blocks to proper LaTeX math notation.
Pattern: multi-line MathML garbage followed by {\displaystyle LATEX}
"""

import os
import re
import glob

REF_DIR = "../../blog/ideas/reference documentation"


def clean_math_in_file(filepath):
    """Clean math notation in a single file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern: capture displaystyle blocks
    # These appear as {\displaystyle ...} on their own line
    # Preceded by garbage MathML lines
    
    # First, find all displaystyle patterns and their preceding garbage
    # The garbage typically starts with whitespace-only lines and single chars/symbols
    
    # Strategy: Find {\displaystyle ...} and look backwards to remove garbage
    
    lines = content.split('\n')
    cleaned_lines = []
    skip_until = -1
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this line contains {\displaystyle
        if '{\\displaystyle' in line:
            # Extract the LaTeX content
            match = re.search(r'\{\\displaystyle\s*(.+?)\}(?:\s*$|\s*,)', line)
            if match:
                latex = match.group(1).strip()
                # Clean up the latex
                latex = latex.replace('\\mathbf', '\\mathbf')
                
                # Look backwards to find where garbage started
                # Garbage lines are typically: empty, single symbols, partial MathML
                garbage_start = len(cleaned_lines)
                while garbage_start > 0:
                    prev = cleaned_lines[garbage_start - 1]
                    # Garbage indicators: very short lines, just whitespace, 
                    # single chars, closing tags, numbers alone
                    stripped = prev.strip()
                    if (len(stripped) <= 3 or 
                        stripped in ['', '(', ')', '+', '-', '=', ',', '.', '×', '−', '⁡'] or
                        re.match(r'^[\d\s]+$', stripped) or
                        re.match(r'^\s*$', prev) or
                        stripped.startswith('{') and not stripped.startswith('{\\') or
                        len(stripped) < 10 and not any(c.isalpha() for c in stripped) or
                        re.match(r'^[A-Za-z]$', stripped) or
                        re.match(r'^[Ggxyθπ]$', stripped, re.UNICODE)):
                        garbage_start -= 1
                    else:
                        break
                
                # Remove garbage lines
                cleaned_lines = cleaned_lines[:garbage_start]
                
                # Add proper LaTeX - use $$ for block display
                cleaned_lines.append(f'$${latex}$$')
                cleaned_lines.append('')
                i += 1
                continue
        
        cleaned_lines.append(line)
        i += 1
    
    # Second pass: clean up remaining isolated MathML fragments
    content = '\n'.join(cleaned_lines)
    
    # Remove lines that are just whitespace followed by single symbols/chars
    # that appear between text (orphaned MathML)
    content = re.sub(r'\n\s*\n(\s+\n)+', '\n\n', content)
    
    # Clean up excessive blank lines
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    # Remove isolated single-char lines that are clearly MathML garbage
    lines = content.split('\n')
    final_lines = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Skip isolated garbage
        if (stripped in ['', '(', ')', '+', '-', '=', ',', '×', '−', '⁡'] or
            (len(stripped) == 1 and stripped.isalpha()) or
            re.match(r'^\d+$', stripped)):
            # Check context - if surrounded by empty or similar, skip
            prev_empty = i == 0 or not lines[i-1].strip()
            next_empty = i == len(lines)-1 or not lines[i+1].strip()
            if prev_empty or next_empty:
                continue
        final_lines.append(line)
    
    content = '\n'.join(final_lines)
    
    # Clean up multiple consecutive blank lines again
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    """Process all markdown files in reference documentation."""
    pattern = os.path.join(REF_DIR, "**", "*.md")
    files = glob.glob(pattern, recursive=True)
    
    # Skip Glossary.md
    files = [f for f in files if 'Glossary.md' not in f]
    
    cleaned = 0
    for filepath in files:
        if clean_math_in_file(filepath):
            print(f"[CLEANED] {os.path.basename(filepath)}")
            cleaned += 1
    
    print(f"\nCleaned {cleaned}/{len(files)} files")


if __name__ == "__main__":
    main()

