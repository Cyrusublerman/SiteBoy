# Bowyer–Watson algorithm

In computational geometry, the Bowyer–Watson algorithm is a method for computing the Delaunay triangulation of a finite set of points in any number of dimensions. The algorithm can be also used to obtain a Voronoi diagram of the points, which is the dual graph of the Delaunay triangulation.


## Description

The Bowyer–Watson algorithm is an incremental algorithm. It works by adding points, one at a time, to a valid Delaunay triangulation of a subset of the desired points. After every insertion, any triangles whose circumcircles contain the new point are deleted, leaving a star-shaped polygonal hole which is then re-triangulated using the new point. By using the connectivity of the triangulation to efficiently locate triangles to remove, the algorithm can take O(N log N) operations to triangulate N points, although special degenerate cases exist where this goes up to O(N).


- First step: insert a node in an enclosing "super"-triangle
- Insert second node
- Insert third node
- Insert fourth node
- Insert fifth (and last) node
- Remove edges with extremes in the super-triangle


## History

The algorithm is sometimes known just as the Bowyer Algorithm or the Watson Algorithm. Adrian Bowyer and David Watson devised it independently of each other at the same time, and each published a paper on it in the same issue of The Computer Journal (see below).


## Pseudocode

The following pseudocode describes a basic implementation of the Bowyer-Watson algorithm. Its time complexity is $O(n^{2})$. Efficiency can be improved in a number of ways. For example, the triangle connectivity can be used to locate the triangles which contain the new point in their circumcircle, without having to check all of the triangles - by doing so we can decrease time complexity to $O(n\log n)$. Pre-computing the circumcircles can save time at the expense of additional memory usage. And if the points are uniformly distributed, sorting them along a space filling Hilbert curve prior to insertion can also speed point location.


## Further reading


- .mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\"""\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#d33)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#d33)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}Bowyer, Adrian (1981). "Computing Dirichlet tessellations". Comput. J. 24 (2): 162–166. doi:10.1093/comjnl/24.2.162.
- Watson, David F. (1981). "Computing the n-dimensional Delaunay tessellation with application to Voronoi polytopes". Comput. J. 24 (2): 167–172. doi:10.1093/comjnl/24.2.167.
- Efficient Triangulation Algorithm Suitable for Terrain Modelling generic explanations with source code examples in several languages.


## External links


- pyDelaunay2D : A didactic Python implementation of Bowyer–Watson algorithm.
- Bl4ckb0ne/delaunay-triangulation : C++ implementation of Bowyer–Watson algorithm.
