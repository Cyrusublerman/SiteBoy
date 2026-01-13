# Boundary tracing

Boundary tracing, also known as contour tracing, of a binary digital region can be thought of as a segmentation technique that identifies the boundary pixels of the digital region. Boundary tracing is an important first step in the analysis of that region.

In topology, a boundary can be defined precisely due to the precise nature of topological spaces. However, digital images do not obey the same rules as topological spaces, and thus the appropriate definition of boundary is less clear. For example, most publications about tracing the boundary of a subset S of a digital image I describe algorithms which find a set of pixels belonging to S and having in their direct neighborhood pixels belonging both to S and to its complement I - S. According to this definition, the boundary of a subset S is different from the boundary of its complement I – S, which is impossible in normal topology.

To define the boundary correctly it is necessary to introduce a topological space corresponding to the given digital image. Such space can be a two-dimensional abstract cell complex. It contains cells of three dimensions: the two-dimensional cells corresponding to pixels of the digital image, the one-dimensional cells or “cracks” representing short lines lying between two adjacent pixels, and the zero-dimensional cells or “points” corresponding to the corners of pixels. The boundary of a subset S is then a sequence of cracks and points while the neighborhoods of these cracks and points intersect both the subset S and its complement I – S.

The boundary defined in this way corresponds exactly to the topological definition and corresponds also to our intuitive imagination of a boundary because the boundary of S should contain neither elements of S nor those of its complement. It should contain only elements lying between S and the complement. These are exactly the cracks and points of the complex.

This corrected method of tracing boundaries is described in a book by Vladimir A. Kovalevsky and in its corresponding website.


## Algorithms


### Types


- Pixel-Following: walks through cells and records them. Typically only traces an outer boundary and require post-processing when changing the size of the space. Easiest to implement
- Vertex-Following Method: walks through edges, recording edges and corners. Typically only traces the outer boundary. Sequential edges can be removed to simplify the data
- Run-Data-Based: processes all cells in the space. Traces all boundaries in the image. Less efficient than other types for small single boundaries since all cells have to be processed. More efficient for large, complex images since the steps per individual cell are usually less than other types


### Examples

Algorithms used for boundary tracing:


- Square tracing algorithm. Can only be used for 4-connected (non-diagonal) patterns and requires the stopping criteria to be entering the starting cell in the same direction as the beginning.
- Moore-neighbor tracing algorithm is similar to the Square tracing algorithm with similar weaknesses but works with 8-connected (diagonal) patterns
- Radial sweep
- Theo Pavlidis’ algorithm tests three cells in front but the check can be short-circuited. Might fail on some patterns.
- A generic approach using vector algebra for tracing of a boundary can be found at
- An extension of boundary tracing for segmentation of traced boundary into open and closed sub-section is described at

Marching squares extracts contours by checking all corners of all cells in a two-dimensional field. It does not use an initial position and does not generate the contour as an ordered sequence so it does not 'trace' the contour. Has to check each cell corner for all four neighbors but since the checks are independent performance can be easily improved with parallel processing


## Square tracing algorithm

The square tracing algorithm is simple, yet effective. Its behavior is completely based on whether one is on a black, or a white cell (assuming white cells are part of the shape). First, scan from the upper left to right and row by row. Upon entering your first white cell, the core of the algorithm starts. It consists mainly of two rules:


- If you are in a white cell, go left.
- If you are in a black cell, go right.

Keep in mind that it matters how you entered the current cell, so that left and right can be defined.


## Radial sweep

The Radial Sweep algorithm, often discussed in literature alongside its more commonly known counterpart, Moore-Neighbor Tracing, presents a seemingly straightforward approach to contour tracing in image processing. While the algorithm's nomenclature may evoke a sense of complexity, its underlying principle aligns closely with the familiar Moore-Neighbor Tracing technique.

Moore-Neighbor Tracing, a prevalent method for delineating boundaries within digital images, navigates the Moore neighborhood of a designated boundary pixel in a predetermined direction, typically clockwise. Upon encountering a black pixel, it designates this pixel as the new boundary point and proceeds iteratively.

However, the Radial Sweep algorithm, while functionally equivalent to Moore-Neighbor Tracing, introduces a novel perspective on identifying the next black pixel within the Moore neighborhood of a given boundary point.

The algorithm's innovation lies in its approach to pinpointing the subsequent boundary pixel. Upon identifying a new boundary pixel, denoted as P, the algorithm establishes it as the current point of interest. It then constructs an imaginary line segment connecting point P to the preceding boundary pixel. Subsequently, the algorithm systematically rotates this segment about point P in a clockwise direction until it intersects with a black pixel within P's Moore neighborhood. Effectively, this rotational movement mirrors the process of inspecting each pixel surrounding point P in the Moore neighborhood.

By employing this method, the Radial Sweep algorithm offers a distinctive strategy for traversing boundary pixels within digital images. While fundamentally akin to Moore-Neighbor Tracing, its emphasis on rotational exploration introduces an intriguing perspective on contour tracing techniques in image analysis and computer vision applications.


## Theo Pavlidis' Algorithm

Theo Pavlidis' Algorithm is a well-known method for contour tracing in binary images proposed, designed to methodically detect and follow the boundaries of related components. The technique starts by locating an initial boundary pixel, which is usually the first black pixel seen while scanning the image from top to bottom and left to right. It begins by examining the vicinity of the current pixel to locate the next boundary pixel, often going in a clockwise orientation to find the next black pixel that makes up the boundary.

The program traces the contour by moving from one border pixel to the next, ensuring that each boundary pixel is only visited once. This systematic technique promotes computing efficiency. The tracing process continues until the algorithm returns to the first border pixel, completing the contour of the item. The approach is reasonably simple to implement, making it a popular choice for a variety of applications such as object detection, shape analysis, and pattern recognition in computer vision and image processing tasks.

Theo Pavlidis' algorithm is renowned for its simplicity, efficiency, and resilience. It can handle a wide range of object shapes and sizes within binary images, making it useful for a variety of image processing applications.


## See also


- Pathfinding
- Curve sketching
- Chain code
- Pixel connectivity
- Optimization problem
