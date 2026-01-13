#!/usr/bin/env python3
"""Batch download Wikipedia pages from Glossary.md into organized folders."""

import os
import re
import time
import wikipedia

# Output base directory
OUTPUT_DIR = "../../blog/ideas/reference documentation"

# Glossary structure: section_name -> list of topics
GLOSSARY = {
    "01_Edge_Gradient_Differential_Operators": [
        "Sobel operator",
        "Scharr operator",
        "Prewitt operator",
        "Roberts cross",
        "Laplacian",
        "Laplacian of Gaussian",
        "Difference of Gaussians",
        "Canny edge detector",
        "Anisotropic diffusion",
        "Total variation denoising",
        "Hessian matrix",
        "Structure tensor",
    ],
    "02_Image_Segmentation_Region_Extraction": [
        "Otsu's method",
        "Watershed (image processing)",
        "Simple linear iterative clustering",
        "Felzenszwalb-Huttenlocher segmentation",
        "Mean shift",
        "Random walker algorithm",
        "GrabCut",
        "Connected-component labeling",
        "Region adjacency graph",
        "Level-set method",
    ],
    "03_Raster_Vector_Conversion": [
        "Marching squares",
        "Marching cubes",
        "Potrace",
        "Medial axis",
        "Grassfire transform",
        "Zhang-Suen thinning algorithm",
        "Ramer–Douglas–Peucker algorithm",
        "Visvalingam–Whyatt algorithm",
        "Bézier curve",
        "B-spline",
        "Non-uniform rational B-spline",
    ],
    "04_Sampling_Point_Distribution": [
        "Poisson disk sampling",
        "Blue noise",
        "Lloyd's algorithm",
        "Jittered sampling",
        "Halton sequence",
        "Sobol sequence",
        "Hammersley set",
        "Stratified sampling",
        "Importance sampling",
        "Rejection sampling",
        "Metropolis–Hastings algorithm",
    ],
    "05_Space_Filling_Curves": [
        "Hilbert curve",
        "Peano curve",
        "Z-order curve",
        "Gosper curve",
        "Sierpiński curve",
        "Dragon curve",
        "H tree",
        "Moore curve",
    ],
    "06_Polygon_Grid_Domain_Subdivision": [
        "Quadtree",
        "Octree",
        "K-d tree",
        "Binary space partitioning",
        "Square tiling",
        "Adaptive mesh refinement",
        "Constrained Delaunay triangulation",
        "Delaunay triangulation",
        "Voronoi diagram",
        "Polygon triangulation",
        "Catmull–Clark subdivision surface",
        "Loop subdivision surface",
    ],
    "07_TSP_Based_Space_Filling": [
        "Travelling salesman problem",
        "Lin–Kernighan heuristic",
        "2-opt",
        "3-opt",
        "Nearest neighbour algorithm",
        "Minimum spanning tree",
        "Christofides algorithm",
    ],
    "08_Reaction_Diffusion_PDE": [
        "Reaction–diffusion system",
        "FitzHugh–Nagumo model",
        "Allen–Cahn equation",
        "Cahn–Hilliard equation",
        "Heat equation",
        "Wave equation",
        "Poisson's equation",
        "Laplace's equation",
        "Diffusion-limited aggregation",
        "Distance transform",
        "Eikonal equation",
        "Fast marching method",
    ],
    "09_Orientation_Fields_Flow": [
        "Tensor voting",
        "Line integral convolution",
        "Streamlines, streaklines, and pathlines",
    ],
    "10_Curve_Theory_Stroke_Geometry": [
        "Frenet–Serret formulas",
        "Curvature",
        "Torsion of a curve",
        "Arc length",
        "Laplacian smoothing",
        "Mean curvature flow",
        "Chaikin's corner cutting",
        "Cubic Hermite spline",
        "Centripetal Catmull–Rom spline",
        "Offset curve",
    ],
    "11_Optimisation_Numerical_Methods": [
        "Gradient descent",
        "Newton's method",
        "Conjugate gradient method",
        "Gauss–Seidel method",
        "Jacobi method",
        "Multigrid method",
        "Simulated annealing",
        "Genetic algorithm",
        "Particle swarm optimization",
        "Markov chain Monte Carlo",
        "Constraint satisfaction problem",
        "Linear programming",
        "Quadratic programming",
    ],
    "12_Triangulation_Meshing_Geometry": [
        "Bowyer–Watson algorithm",
        "Fortune's algorithm",
        "Alpha shape",
        "Power diagram",
        "Polygon mesh",
    ],
    "13_Distance_Morphology_Topology": [
        "Euclidean distance",
        "Taxicab geometry",
        "Dilation (morphology)",
        "Erosion (morphology)",
        "Opening (morphology)",
        "Closing (morphology)",
        "Hit-or-miss transform",
        "Persistent homology",
    ],
    "14_Signal_Processing_Filtering": [
        "Discrete Fourier transform",
        "Discrete cosine transform",
        "Wavelet transform",
        "Haar wavelet",
        "Daubechies wavelet",
        "Convolution",
        "Gaussian blur",
        "Bilateral filter",
        "Guided filter",
    ],
    "15_Colour_Perceptual_Models": [
        "CIE 1931 color space",
        "CIELAB color space",
        "CIELUV",
        "HSL and HSV",
        "Color difference",
        "Opponent process",
        "Median cut",
        "Color quantization",
    ],
    "16_Graphs_Connectivity_Pathfinding": [
        "Breadth-first search",
        "Depth-first search",
        "A* search algorithm",
        "Dijkstra's algorithm",
        "Shortest-path tree",
        "Laplacian matrix",
        "Spectral clustering",
    ],
}


def sanitize_filename(name):
    """Convert topic name to safe filename."""
    return re.sub(r'[<>:"/\\|?*]', '', name.replace(' ', '_').replace('–', '-').replace('—', '-'))


def download_topic(topic, output_folder):
    """Download a single Wikipedia topic to markdown."""
    filename = sanitize_filename(topic) + ".md"
    filepath = os.path.join(output_folder, filename)
    
    if os.path.exists(filepath):
        print(f"  [SKIP] {topic} - already exists")
        return True
    
    try:
        page = wikipedia.page(topic, auto_suggest=False)
        markdown_text = f"# {page.title}\n\n"
        
        page_content = re.sub(r"=== ([^=]+) ===", r"### \1", page.content)
        page_content = re.sub(r"== ([^=]+) ==", r"## \1", page_content)
        
        sections = re.split(r"\n(## .*)\n", page_content)
        for i in range(0, len(sections), 2):
            if i + 1 < len(sections) and any(
                line.strip() for line in sections[i + 1].split("\n")
            ):
                markdown_text += f"{sections[i]}\n{sections[i+1]}\n\n"
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(markdown_text)
        
        print(f"  [OK] {topic}")
        return True
        
    except wikipedia.exceptions.DisambiguationError as e:
        print(f"  [DISAMBIG] {topic} - options: {e.options[:3]}...")
        # Try first option
        if e.options:
            try:
                page = wikipedia.page(e.options[0], auto_suggest=False)
                markdown_text = f"# {page.title}\n\n"
                page_content = re.sub(r"=== ([^=]+) ===", r"### \1", page.content)
                page_content = re.sub(r"== ([^=]+) ==", r"## \1", page_content)
                sections = re.split(r"\n(## .*)\n", page_content)
                for i in range(0, len(sections), 2):
                    if i + 1 < len(sections) and any(
                        line.strip() for line in sections[i + 1].split("\n")
                    ):
                        markdown_text += f"{sections[i]}\n{sections[i+1]}\n\n"
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(markdown_text)
                print(f"    [OK] Used: {e.options[0]}")
                return True
            except Exception:
                pass
        return False
        
    except wikipedia.exceptions.PageError:
        print(f"  [NOT FOUND] {topic}")
        return False
        
    except Exception as e:
        print(f"  [ERROR] {topic}: {e}")
        return False


def main():
    wikipedia.set_lang("en")
    
    total = 0
    success = 0
    failed = []
    
    for section_name, topics in GLOSSARY.items():
        print(f"\n=== {section_name} ===")
        
        section_path = os.path.join(OUTPUT_DIR, section_name)
        os.makedirs(section_path, exist_ok=True)
        
        for topic in topics:
            total += 1
            time.sleep(0.5)  # Rate limiting
            
            if download_topic(topic, section_path):
                success += 1
            else:
                failed.append(f"{section_name}/{topic}")
    
    print(f"\n{'='*50}")
    print(f"Complete: {success}/{total} successful")
    
    if failed:
        print(f"\nFailed downloads:")
        for f in failed:
            print(f"  - {f}")


if __name__ == "__main__":
    main()

