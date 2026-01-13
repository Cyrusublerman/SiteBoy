#!/usr/bin/env python3
"""Download additional Wikipedia articles from Point Distribution and Space Filling PDFs."""

import os
import re
import time
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/html"
OUTPUT_BASE = "../../blog/ideas/reference documentation"


def fetch_wiki_html(title):
    """Fetch HTML from Wikipedia REST API."""
    url = f"{BASE_URL}/{title}"
    headers = {
        "Accept": "text/html",
        "User-Agent": "SiteBoy-Reference-Downloader/1.0"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code == 200:
            return resp.text
        return None
    except Exception as e:
        print(f"    Network error: {e}")
        return None


def clean_latex(latex):
    if not latex:
        return ""
    latex = latex.strip()
    if latex.startswith("{\\displaystyle") and latex.endswith("}"):
        latex = latex[len("{\\displaystyle"):-1].strip()
    return latex


def process_element(elem):
    if elem.name is None:
        return str(elem)
    
    if elem.name == 'math':
        latex = elem.get('alttext', '')
        latex = clean_latex(latex)
        if latex:
            if len(latex) > 50 or '\\begin' in latex or '\\frac' in latex or '\\sum' in latex:
                return f'\n$${latex}$$\n'
            else:
                return f'${latex}$'
        return ''
    
    if elem.name == 'sup':
        ref_id = elem.get('id', '')
        if 'cite_ref' in ref_id:
            return ''
        return ''
    
    if elem.name == 'a':
        return elem.get_text()
    
    if elem.name in ['span', 'i', 'b', 'em', 'strong']:
        return ''.join(process_element(c) for c in elem.children)
    
    if elem.name == 'br':
        return '\n'
    
    return elem.get_text()


def process_paragraph(p):
    parts = []
    for child in p.children:
        parts.append(process_element(child))
    
    text = ''.join(parts)
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'\s*\$\$\s*', '\n$$', text)
    text = re.sub(r'\$\$\s+', '$$\n', text)
    return text


def process_list(ul_or_ol):
    lines = []
    is_ordered = ul_or_ol.name == 'ol'
    
    for i, li in enumerate(ul_or_ol.find_all('li', recursive=False)):
        prefix = f"{i+1}. " if is_ordered else "- "
        text = process_paragraph(li)
        if text:
            lines.append(f"{prefix}{text}")
    
    return '\n'.join(lines)


def html_to_markdown(html, title):
    soup = BeautifulSoup(html, 'html.parser')
    display_title = title.replace('_', ' ')
    md_lines = [f"# {display_title}\n"]
    
    sections = soup.find_all('section')
    
    for section in sections:
        heading = section.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if heading:
            level = int(heading.name[1])
            heading_text = heading.get_text().strip()
            
            if heading_text.lower() in ['references', 'notes', 'citations', 'bibliography']:
                continue
            
            md_lines.append(f"\n{'#' * level} {heading_text}\n")
        
        for child in section.children:
            if child.name == 'p':
                text = process_paragraph(child)
                if text and len(text) > 10:
                    md_lines.append(f"{text}\n")
            
            elif child.name in ['ul', 'ol']:
                list_md = process_list(child)
                if list_md:
                    md_lines.append(f"\n{list_md}\n")
            
            elif child.name == 'dl':
                for dt in child.find_all('dt'):
                    term = dt.get_text().strip()
                    if term:
                        md_lines.append(f"\n**{term}**\n")
                for dd in child.find_all('dd'):
                    desc = process_paragraph(dd)
                    if desc:
                        md_lines.append(f"{desc}\n")
            
            elif child.name == 'table':
                caption = child.find('caption')
                if caption:
                    md_lines.append(f"\n*[Table: {caption.get_text().strip()}]*\n")
    
    content = '\n'.join(md_lines)
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    content = re.sub(r' +', ' ', content)
    content = re.sub(r'\n +', '\n', content)
    
    return content


def download_article(title, output_path):
    html = fetch_wiki_html(title)
    if not html:
        return False
    
    display_title = title.replace('_', ' ')
    md = html_to_markdown(html, display_title)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    
    return True


# New articles to download (not already in numbered folders)
EXTRA_ARTICLES = {
    # Point Distribution extras → add to 04_Sampling_Point_Distribution
    "04_Sampling_Point_Distribution": [
        "Delaunay_refinement",
        "Delone_set",
        "Farthest-first_traversal",
        "Gradient_pattern_analysis",
    ],
    # Space filling extras → add to 05_Space_Filling_Curves
    "05_Space_Filling_Curves": [
        "Bx-tree",
        ("Cannon–Thurston_map", "Cannon-Thurston_map.md"),
        "Flood_fill",
        "Koch_snowflake",
        "Kolam",
        "L-system",
        ("Lévy_C_curve", "Levy_C_curve.md"),
        "Self-avoiding_walk",
        "Space-filling_tree",
    ],
}


def main():
    total = 0
    success = 0
    failed = []
    
    for section_name, articles in EXTRA_ARTICLES.items():
        print(f"\n=== {section_name} ===")
        
        section_path = os.path.join(OUTPUT_BASE, section_name)
        os.makedirs(section_path, exist_ok=True)
        
        for article in articles:
            if isinstance(article, tuple):
                wiki_title, filename = article
            else:
                wiki_title = article
                filename = f"{article}.md"
            
            total += 1
            output_path = os.path.join(section_path, filename)
            
            print(f"  {wiki_title}...", end=" ", flush=True)
            
            if download_article(wiki_title, output_path):
                print("[OK]")
                success += 1
            else:
                print("[FAIL]")
                failed.append(f"{section_name}/{wiki_title}")
            
            time.sleep(0.3)
    
    print(f"\n{'='*50}")
    print(f"Complete: {success}/{total} successful")
    
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for f in failed:
            print(f"  - {f}")


if __name__ == "__main__":
    main()

