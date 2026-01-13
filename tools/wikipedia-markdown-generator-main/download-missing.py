#!/usr/bin/env python3
"""Download missing Wikipedia articles for processing library."""

import os
import re
import time
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/html"
OUTPUT_BASE = "../../blog/ideas/reference documentation"


def fetch_wiki_html(title):
    url = f"{BASE_URL}/{title}"
    headers = {"Accept": "text/html", "User-Agent": "SiteBoy-Reference-Downloader/1.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        return resp.text if resp.status_code == 200 else None
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
    if elem.name == "math":
        latex = elem.get("alttext", "")
        latex = clean_latex(latex)
        if latex:
            if len(latex) > 50 or "\\begin" in latex or "\\frac" in latex or "\\sum" in latex:
                return f"\n$${latex}$$\n"
            return f"${latex}$"
        return ""
    if elem.name == "sup" and "cite_ref" in elem.get("id", ""):
        return ""
    if elem.name == "a":
        return elem.get_text()
    if elem.name in ["span", "i", "b", "em", "strong"]:
        return "".join(process_element(c) for c in elem.children)
    return elem.get_text()


def process_paragraph(p):
    parts = [process_element(c) for c in p.children]
    text = "".join(parts)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def process_list(ul_or_ol):
    lines = []
    is_ordered = ul_or_ol.name == "ol"
    for i, li in enumerate(ul_or_ol.find_all("li", recursive=False)):
        prefix = f"{i+1}. " if is_ordered else "- "
        text = process_paragraph(li)
        if text:
            lines.append(f"{prefix}{text}")
    return "\n".join(lines)


def html_to_markdown(html, title):
    soup = BeautifulSoup(html, "html.parser")
    display_title = title.replace("_", " ")
    md_lines = [f"# {display_title}\n"]
    
    for section in soup.find_all("section"):
        heading = section.find(["h1", "h2", "h3", "h4", "h5", "h6"])
        if heading:
            level = int(heading.name[1])
            ht = heading.get_text().strip()
            if ht.lower() in ["references", "notes", "citations", "bibliography"]:
                continue
            md_lines.append(f"\n{'#' * level} {ht}\n")
        
        for child in section.children:
            if child.name == "p":
                text = process_paragraph(child)
                if text and len(text) > 10:
                    md_lines.append(f"{text}\n")
            elif child.name in ["ul", "ol"]:
                list_md = process_list(child)
                if list_md:
                    md_lines.append(f"\n{list_md}\n")
    
    content = "\n".join(md_lines)
    content = re.sub(r"\n{4,}", "\n\n\n", content)
    return content


def download_article(title, output_path):
    html = fetch_wiki_html(title)
    if not html:
        return False
    md = html_to_markdown(html, title.replace("_", " "))
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)
    return True


# Missing articles to download
MISSING = {
    "08_Reaction_Diffusion_PDE": [
        ("Gray%E2%80%93Scott_model", "Gray-Scott_model.md"),
        ("Turing_pattern", "Turing_pattern.md"),
    ],
    "06_Polygon_Grid_Domain_Subdivision": [
        ("Point_in_polygon", "Point_in_polygon.md"),
        ("Polygon_partition", "Polygon_partition.md"),
    ],
    "03_Raster_Vector_Conversion": [
        ("Boundary_tracing", "Boundary_tracing.md"),
    ],
    "10_Curve_Theory_Stroke_Geometry": [
        ("Curve_fitting", "Curve_fitting.md"),
    ],
    "12_Triangulation_Meshing_Geometry": [
        ("Ear_clipping", "Ear_clipping.md"),
    ],
}


def main():
    for section, articles in MISSING.items():
        print(f"\n=== {section} ===")
        section_path = os.path.join(OUTPUT_BASE, section)
        os.makedirs(section_path, exist_ok=True)
        
        for wiki_title, filename in articles:
            filepath = os.path.join(section_path, filename)
            print(f"  {wiki_title}...", end=" ", flush=True)
            if download_article(wiki_title, filepath):
                print("[OK]")
            else:
                print("[FAIL]")
            time.sleep(0.3)
    
    print("\nDone!")


if __name__ == "__main__":
    main()

