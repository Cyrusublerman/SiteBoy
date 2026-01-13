#!/usr/bin/env python3
"""Clean up broken MathML - v2 with better brace matching."""

import os
import re
import glob

REF_DIR = "../../blog/ideas/reference documentation"


def extract_displaystyle(text):
    """Extract content from {\displaystyle ...} with proper brace matching."""
    start = text.find('{\\displaystyle')
    if start == -1:
        return None
    
    # Find matching closing brace
    depth = 0
    i = start
    while i < len(text):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                # Extract the content between {\displaystyle and final }
                inner = text[start + len('{\\displaystyle'):i]
                return inner.strip()
        i += 1
    return None


def clean_file(filepath):
    """Clean a single file with improved math handling."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Find all {\displaystyle ...} blocks and extract them properly
    lines = content.split('\n')
    result_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if line contains displaystyle
        if '{\\displaystyle' in line:
            # May need to join multiple lines if braces span lines
            full_block = line
            while full_block.count('{') > full_block.count('}') and i + 1 < len(lines):
                i += 1
                full_block += '\n' + lines[i]
            
            latex = extract_displaystyle(full_block)
            
            if latex:
                # Look backwards to remove garbage MathML
                garbage_start = len(result_lines)
                while garbage_start > 0:
                    prev = result_lines[garbage_start - 1].strip()
                    # Garbage: short lines, single symbols, partial MathML
                    is_garbage = (
                        len(prev) <= 4 or
                        prev in ['', '(', ')', '+', '-', '=', ',', '.', '×', '−', '⁡', '/', '*'] or
                        re.match(r'^[\d\s]+$', prev) or
                        re.match(r'^[A-Za-zα-ωΑ-Ω]$', prev) or
                        (len(prev) < 15 and not any(c.isalpha() and c not in 'αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' for c in prev)) or
                        prev.startswith('{') and '\\' not in prev
                    )
                    if is_garbage:
                        garbage_start -= 1
                    else:
                        break
                
                result_lines = result_lines[:garbage_start]
                result_lines.append(f'$${latex}$$')
                result_lines.append('')
            else:
                result_lines.append(line)
        else:
            result_lines.append(line)
        i += 1
    
    content = '\n'.join(result_lines)
    
    # Clean orphaned short lines that look like MathML garbage
    lines = content.split('\n')
    final_lines = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Skip isolated single-char/symbol garbage
        if stripped in ['', '(', ')', '+', '-', '=', ',', '×', '−', '⁡'] or \
           (len(stripped) == 1 and (stripped.isalpha() or stripped.isdigit())):
            prev_empty = i == 0 or not lines[i-1].strip()
            next_empty = i >= len(lines)-1 or not lines[i+1].strip()
            if prev_empty or next_empty:
                continue
        final_lines.append(line)
    
    content = '\n'.join(final_lines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    pattern = os.path.join(REF_DIR, "**", "*.md")
    files = glob.glob(pattern, recursive=True)
    files = [f for f in files if 'Glossary.md' not in f]
    
    cleaned = 0
    for filepath in files:
        if clean_file(filepath):
            print(f"[FIXED] {os.path.basename(filepath)}")
            cleaned += 1
    
    print(f"\nFixed {cleaned}/{len(files)} files")


if __name__ == "__main__":
    main()

