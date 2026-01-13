#!/usr/bin/env python3
"""Wikipedia REST API batch downloader - all 145 articles."""

import os
import re
import time
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/html"
OUTPUT_BASE = "../../blog/ideas/reference documentation"

# All sections and their Wikipedia article titles
SECTIONS = {
    "01_Edge_Gradient_Differential_Operators": [
        "Sobel_operator",
        "Scharr_operator",
        "Prewitt_operator",
        "Roberts_cross",
        "Laplacian",
        "Laplacian_of_Gaussian",
        "Difference_of_Gaussians",
        "Canny_edge_detector",
        "Anisotropic_diffusion",
        "Total_variation_denoising",
        "Hessian_matrix",
        "Structure_tensor",
    ],
    "02_Image_Segmentation_Region_Extraction": [
        ("Otsu's_method", "Otsu's_method.md"),
        "Watershed_(image_processing)",
        "Image_segmentation",  # covers SLIC
        ("Graph-based_image_segmentation", "Felzenszwalb-Huttenlocher_segmentation.md"),
        "Mean_shift",
        "Random_walker_algorithm",
        "GrabCut",
        "Connected-component_labeling",
        "Level-set_method",
    ],
    "03_Raster_Vector_Conversion": [
        "Marching_squares",
        "Marching_cubes",
        "Potrace",
        "Medial_axis",
        "Grassfire_transform",
        ("Topological_skeleton", "Zhang-Suen_thinning_algorithm.md"),
        ("Ramer–Douglas–Peucker_algorithm", "Ramer-Douglas-Peucker_algorithm.md"),
        ("Visvalingam–Whyatt_algorithm", "Visvalingam-Whyatt_algorithm.md"),
        ("Bézier_curve", "Bézier_curve.md"),
        "B-spline",
        "Non-uniform_rational_B-spline",
    ],
    "04_Sampling_Point_Distribution": [
        "Poisson_disk_sampling",
        "Blue_noise",
        ("Lloyd's_algorithm", "Lloyd's_algorithm.md"),
        ("Supersampling", "Jittered_sampling.md"),
        "Halton_sequence",
        "Sobol_sequence",
        "Hammersley_set",
        "Stratified_sampling",
        "Importance_sampling",
        "Rejection_sampling",
        ("Metropolis–Hastings_algorithm", "Metropolis-Hastings_algorithm.md"),
    ],
    "05_Space_Filling_Curves": [
        "Hilbert_curve",
        "Peano_curve",
        "Z-order_curve",
        "Gosper_curve",
        ("Sierpiński_curve", "Sierpiński_curve.md"),
        "Dragon_curve",
        "H_tree",
        "Moore_curve",
    ],
    "06_Polygon_Grid_Domain_Subdivision": [
        "Quadtree",
        "Octree",
        "K-d_tree",
        "Binary_space_partitioning",
        "Square_tiling",
        "Adaptive_mesh_refinement",
        "Constrained_Delaunay_triangulation",
        "Delaunay_triangulation",
        "Voronoi_diagram",
        "Polygon_triangulation",
        ("Catmull–Clark_subdivision_surface", "Catmull-Clark_subdivision_surface.md"),
        "Loop_subdivision_surface",
    ],
    "07_TSP_Based_Space_Filling": [
        "Travelling_salesman_problem",
        ("Lin–Kernighan_heuristic", "Lin-Kernighan_heuristic.md"),
        "2-opt",
        "3-opt",
        "Nearest_neighbour_algorithm",
        "Minimum_spanning_tree",
        "Christofides_algorithm",
    ],
    "08_Reaction_Diffusion_PDE": [
        ("Reaction–diffusion_system", "Reaction-diffusion_system.md"),
        ("FitzHugh–Nagumo_model", "FitzHugh-Nagumo_model.md"),
        ("Allen–Cahn_equation", "Allen-Cahn_equation.md"),
        ("Cahn–Hilliard_equation", "Cahn-Hilliard_equation.md"),
        "Heat_equation",
        "Wave_equation",
        ("Poisson's_equation", "Poisson's_equation.md"),
        ("Laplace's_equation", "Laplace's_equation.md"),
        "Diffusion-limited_aggregation",
        "Distance_transform",
        "Eikonal_equation",
        "Fast_marching_method",
    ],
    "09_Orientation_Fields_Flow": [
        ("Orientation_(geometry)", "Tensor_voting.md"),
        "Line_integral_convolution",
        ("Streamlines,_streaklines,_and_pathlines", "Streamlines,_streaklines,_and_pathlines.md"),
    ],
    "10_Curve_Theory_Stroke_Geometry": [
        ("Frenet–Serret_formulas", "Frenet-Serret_formulas.md"),
        "Curvature",
        "Torsion_of_a_curve",
        "Arc_length",
        "Laplacian_smoothing",
        "Mean_curvature_flow",
        "Subdivision_surface",  # covers Chaikin
        "Cubic_Hermite_spline",
        ("Centripetal_Catmull–Rom_spline", "Centripetal_Catmull-Rom_spline.md"),
        "Offset_curve",
    ],
    "11_Optimisation_Numerical_Methods": [
        "Gradient_descent",
        ("Newton's_method", "Newton's_method.md"),
        "Conjugate_gradient_method",
        ("Gauss–Seidel_method", "Gauss-Seidel_method.md"),
        "Jacobi_method",
        "Multigrid_method",
        "Simulated_annealing",
        "Genetic_algorithm",
        "Particle_swarm_optimization",
        "Markov_chain_Monte_Carlo",
        "Constraint_satisfaction_problem",
        "Linear_programming",
        "Quadratic_programming",
    ],
    "12_Triangulation_Meshing_Geometry": [
        ("Bowyer–Watson_algorithm", "Bowyer-Watson_algorithm.md"),
        ("Fortune's_algorithm", "Fortune's_algorithm.md"),
        "Alpha_shape",
        "Power_diagram",
        "Polygon_mesh",
    ],
    "13_Distance_Morphology_Topology": [
        "Euclidean_distance",
        "Taxicab_geometry",
        "Dilation_(morphology)",
        "Erosion_(morphology)",
        "Opening_(morphology)",
        "Closing_(morphology)",
        "Hit-or-miss_transform",
        "Persistent_homology",
    ],
    "14_Signal_Processing_Filtering": [
        "Discrete_Fourier_transform",
        "Discrete_cosine_transform",
        "Wavelet_transform",
        "Haar_wavelet",
        "Daubechies_wavelet",
        "Convolution",
        "Gaussian_blur",
        "Bilateral_filter",
        "Guided_filter",
    ],
    "15_Colour_Perceptual_Models": [
        "CIE_1931_color_space",
        "CIELAB_color_space",
        "CIELUV",
        "HSL_and_HSV",
        "Color_difference",
        "Opponent_process",
        "Median_cut",
        "Color_quantization",
    ],
    "16_Graphs_Connectivity_Pathfinding": [
        "Breadth-first_search",
        "Depth-first_search",
        ("A*_search_algorithm", "A_search_algorithm.md"),
        ("Dijkstra's_algorithm", "Dijkstra's_algorithm.md"),
        "Shortest-path_tree",
        "Laplacian_matrix",
        "Spectral_clustering",
    ],
}


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
        else:
            return None
    except Exception as e:
        print(f"    Network error: {e}")
        return None


def clean_latex(latex):
    """Clean up LaTeX from alttext attribute."""
    if not latex:
        return ""
    latex = latex.strip()
    if latex.startswith("{\\displaystyle") and latex.endswith("}"):
        latex = latex[len("{\\displaystyle"):-1].strip()
    return latex


def process_element(elem):
    """Recursively process an element to markdown."""
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
    """Convert a paragraph element to markdown text."""
    parts = []
    for child in p.children:
        parts.append(process_element(child))
    
    text = ''.join(parts)
    text = re.sub(r'\s+', ' ', text).strip()
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
    """Download a single article to markdown."""
    html = fetch_wiki_html(title)
    if not html:
        return False
    
    display_title = title.replace('_', ' ')
    md = html_to_markdown(html, display_title)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    
    return True


def main():
    """Download all articles."""
    total = 0
    success = 0
    failed = []
    
    for section_name, articles in SECTIONS.items():
        print(f"\n=== {section_name} ===")
        
        section_path = os.path.join(OUTPUT_BASE, section_name)
        os.makedirs(section_path, exist_ok=True)
        
        for article in articles:
            # Handle tuple (wiki_title, local_filename) or just string
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

