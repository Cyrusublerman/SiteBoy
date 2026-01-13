#!/usr/bin/env python3
"""Wikipedia REST API markdown generator with proper LaTeX extraction."""

import os
import re
import time
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/html"


def fetch_wiki_html(title):
    """Fetch HTML from Wikipedia REST API."""
    url = f"{BASE_URL}/{title.replace(' ', '_')}"
    headers = {
        "Accept": "text/html",
        "User-Agent": "SiteBoy-Reference-Downloader/1.0"
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.text
    else:
        print(f"  [ERROR] HTTP {resp.status_code} for {title}")
        return None


def clean_latex(latex):
    """Clean up LaTeX from alttext attribute."""
    if not latex:
        return ""
    # Remove outer displaystyle wrapper if present
    latex = latex.strip()
    if latex.startswith("{\\displaystyle") and latex.endswith("}"):
        latex = latex[len("{\\displaystyle"):-1].strip()
    return latex


def process_element(elem):
    """Recursively process an element to markdown."""
    if elem.name is None:  # NavigableString
        return str(elem)
    
    if elem.name == 'math':
        # Extract LaTeX from alttext
        latex = elem.get('alttext', '')
        latex = clean_latex(latex)
        if latex:
            # Determine if inline or block
            if len(latex) > 50 or '\\begin' in latex or '\\frac' in latex:
                return f'\n$${latex}$$\n'
            else:
                return f'${latex}$'
        return ''
    
    if elem.name == 'sup':
        # Superscript - often references, skip citation refs
        ref_id = elem.get('id', '')
        if 'cite_ref' in ref_id:
            return ''
        return ''
    
    if elem.name == 'a':
        # Links - just get text
        return elem.get_text()
    
    if elem.name in ['span', 'i', 'b', 'em', 'strong']:
        # Inline formatting - recurse
        return ''.join(process_element(c) for c in elem.children)
    
    if elem.name == 'br':
        return '\n'
    
    # Default: get text
    return elem.get_text()


def process_paragraph(p):
    """Convert a paragraph element to markdown text."""
    parts = []
    for child in p.children:
        parts.append(process_element(child))
    
    text = ''.join(parts)
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # But preserve math blocks
    text = re.sub(r'\s*\$\$\s*', '\n$$', text)
    text = re.sub(r'\$\$\s+', '$$\n', text)
    return text


def process_list(ul_or_ol):
    """Convert list element to markdown."""
    lines = []
    is_ordered = ul_or_ol.name == 'ol'
    
    for i, li in enumerate(ul_or_ol.find_all('li', recursive=False)):
        prefix = f"{i+1}. " if is_ordered else "- "
        text = process_paragraph(li)
        if text:
            lines.append(f"{prefix}{text}")
    
    return '\n'.join(lines)


def html_to_markdown(html, title):
    """Convert Wikipedia HTML to clean markdown."""
    soup = BeautifulSoup(html, 'html.parser')
    md_lines = [f"# {title}\n"]
    
    # Find main content sections
    sections = soup.find_all('section')
    
    for section in sections:
        # Get section heading
        heading = section.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if heading:
            level = int(heading.name[1])
            heading_text = heading.get_text().strip()
            
            # Skip certain sections
            if heading_text.lower() in ['references', 'notes', 'citations', 'bibliography']:
                continue
            
            md_lines.append(f"\n{'#' * level} {heading_text}\n")
        
        # Process direct children (paragraphs, lists, etc.)
        for child in section.children:
            if child.name == 'p':
                text = process_paragraph(child)
                if text and len(text) > 10:  # Skip tiny fragments
                    md_lines.append(f"{text}\n")
            
            elif child.name in ['ul', 'ol']:
                list_md = process_list(child)
                if list_md:
                    md_lines.append(f"\n{list_md}\n")
            
            elif child.name == 'dl':
                # Definition list
                for dt in child.find_all('dt'):
                    term = dt.get_text().strip()
                    if term:
                        md_lines.append(f"\n**{term}**\n")
                for dd in child.find_all('dd'):
                    desc = process_paragraph(dd)
                    if desc:
                        md_lines.append(f"{desc}\n")
            
            elif child.name == 'table':
                # Skip complex tables for now, note their presence
                caption = child.find('caption')
                if caption:
                    md_lines.append(f"\n*[Table: {caption.get_text().strip()}]*\n")
    
    content = '\n'.join(md_lines)
    
    # Clean up
    content = re.sub(r'\n{4,}', '\n\n\n', content)  # Max 2 blank lines
    content = re.sub(r' +', ' ', content)  # Multiple spaces
    content = re.sub(r'\n +', '\n', content)  # Leading spaces on lines
    
    return content


def download_article(title, output_path):
    """Download a single article to markdown."""
    html = fetch_wiki_html(title)
    if not html:
        return False
    
    md = html_to_markdown(html, title.replace('_', ' '))
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    
    return True


def main():
    """Test on Edge/Gradient/Differential Operators folder."""
    
    # Map of Wikipedia titles to local filenames
    articles = {
        "Canny_edge_detector": "Canny_edge_detector.md",
        "Sobel_operator": "Sobel_operator.md",
        "Scharr_operator": "Scharr_operator.md",
        "Prewitt_operator": "Prewitt_operator.md",
        "Roberts_cross": "Roberts_cross.md",
        "Laplacian": "Laplacian.md",
        "Laplacian_of_Gaussian": "Laplacian_of_Gaussian.md",
        "Difference_of_Gaussians": "Difference_of_Gaussians.md",
        "Anisotropic_diffusion": "Anisotropic_diffusion.md",
        "Total_variation_denoising": "Total_variation_denoising.md",
        "Hessian_matrix": "Hessian_matrix.md",
        "Structure_tensor": "Structure_tensor.md",
    }
    
    output_dir = "../../blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators"
    os.makedirs(output_dir, exist_ok=True)
    
    success = 0
    for title, filename in articles.items():
        print(f"Downloading: {title}...")
        output_path = os.path.join(output_dir, filename)
        
        if download_article(title, output_path):
            print(f"  [OK] {filename}")
            success += 1
        else:
            print(f"  [FAIL] {filename}")
        
        time.sleep(0.3)  # Rate limiting
    
    print(f"\nComplete: {success}/{len(articles)}")


if __name__ == "__main__":
    main()

