# Polygon mesh

In 3D computer graphics and solid modeling, a polygon mesh is a collection of .mw-parser-output .vanchor>:target~.vanchor-text{background-color:#b1d2ff}@media screen{html.skin-theme-clientpref-night .mw-parser-output .vanchor>:target~.vanchor-text{background-color:#0f4dc9}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .vanchor>:target~.vanchor-text{background-color:#0f4dc9}}vertices, edges and faces that defines the shape of a polyhedral object's surface. It simplifies rendering, as in a wire-frame model. The faces usually consist of triangles (triangle mesh), quadrilaterals (quads), or other simple convex polygons (n-gons). A polygonal mesh may also be more generally composed of concave polygons, or even polygons with holes.

The study of polygon meshes is a large sub-field of computer graphics (specifically 3D computer graphics) and geometric modeling. Different representations of polygon meshes are used for different applications and goals. The variety of operations performed on meshes includes Boolean logic (Constructive solid geometry), smoothing, and simplification. Algorithms also exist for ray tracing, collision detection, and rigid-body dynamics with polygon meshes. If the mesh's edges are rendered instead of the faces, then the model becomes a wireframe model.

Several methods exist for mesh generation, including the marching cubes algorithm.

Volumetric meshes are distinct from polygon meshes in that they explicitly represent both the surface and interior region of a structure, while polygon meshes only explicitly represent the surface (the volume is implicit).


## Elements

Objects created with polygon meshes must store different types of elements. These include vertices, edges, faces, polygons and surfaces. In many applications, only vertices, edges and either faces or polygons are stored. A renderer may support only 3-sided faces, so polygons must be constructed of many of these, as shown above. However, many renderers either support quads and higher-sided polygons, or are able to convert polygons to triangles on the fly, making it unnecessary to store a mesh in a triangulated form.


### Vertices

A vertex (plural vertices) in computer graphics is a data structure that describes at least the position of a point in 2D or 3D space on a surface. The vertices of triangles often are associated not only with spatial position but also with attributes, other values used to render the object correctly. Most attributes of a vertex represent vectors in the space to be rendered. These vectors are typically 1 (x), 2 (x, y), or 3 (x, y, z) dimensional and can include a fourth homogeneous coordinate (w). These values are given meaning by a material description. In real-time rendering these properties are used by a vertex shader or vertex pipeline. Such attributes can include:


### Polygons

Polygons are used in computer graphics to compose images that are three-dimensional in appearance, and are one of the most popular geometric building blocks in computer graphics. Polygons are built up of vertices, and are typically used as triangles.

A model's polygons can be rendered and seen simply in a wire frame model, where the outlines of the polygons are seen, as opposed to having them be shaded. This is the reason for a polygon stage in computer animation. The polygon count refers to the number of polygons being rendered per frame.

Beginning with the fifth generation of video game consoles, the use of polygons became more common, and with each succeeding generation, polygonal models became increasingly complex.


## Representations

Polygon meshes may be represented in a variety of ways, using different methods to store the vertex, edge and face data. These include:

Each of the representations above have particular advantages and drawbacks, further discussed in Smith (2006). The choice of the data structure is governed by the application, the performance required, size of the data, and the operations to be performed. For example, it is easier to deal with triangles than general polygons, especially in computational geometry. For certain operations it is necessary to have a fast access to topological information such as edges or neighboring faces; this requires more complex structures such as the winged-edge representation. For hardware rendering, compact, simple structures are needed; thus the corner-table (triangle fan) is commonly incorporated into low-level rendering APIs such as DirectX and OpenGL.


### Vertex-vertex meshes

Vertex-vertex meshes represent an object as a set of vertices connected to other vertices. This is the simplest representation, but not widely used since the face and edge information is implicit. Thus, it is necessary to traverse the data in order to generate a list of faces for rendering. In addition, operations on edges and faces are not easily accomplished.

However, VV meshes benefit from small storage space and efficient morphing of shape. The above figure shows a four-sided box as represented by a VV mesh. Each vertex indexes its neighboring vertices. The last two vertices, 8 and 9 at the top and bottom center of the "box-cylinder", have four connected vertices rather than five. A general system must be able to handle an arbitrary number of vertices connected to any given vertex.

For a complete description of VV meshes see Smith (2006).


### Face-vertex meshes

Face-vertex meshes represent an object as a set of faces and a set of vertices. This is the most widely used mesh representation, being the input typically accepted by modern graphics hardware.

Face-vertex meshes improve on VV mesh for modeling in that they allow explicit lookup of the vertices of a face, and the faces surrounding a vertex. The above figure shows the "box-cylinder" example as an FV mesh. Vertex v5 is highlighted to show the faces that surround it. Notice that, in this example, every face is required to have exactly 3 vertices. However, this does not mean every vertex has the same number of surrounding faces.

For rendering, the face list is usually transmitted to the GPU as a set of indices to vertices, and the vertices are sent as position/color/normal structures (in the figure, only position is given). This has the benefit that changes in shape, but not geometry, can be dynamically updated by simply resending the vertex data without updating the face connectivity.

Modeling requires easy traversal of all structures. With face-vertex meshes it is easy to find the vertices of a face. Also, the vertex list contains a list of faces connected to each vertex. Unlike VV meshes, both faces and vertices are explicit, so locating neighboring faces and vertices is constant time. However, the edges are implicit, so a search is still needed to find all the faces surrounding a given face. Other dynamic operations, such as splitting or merging a face, are also difficult with face-vertex meshes.


### Winged-edge meshes

Introduced by Baumgart in 1975, winged-edge meshes explicitly represent the vertices, faces, and edges of a mesh. This representation is widely used in modeling programs to provide the greatest flexibility in dynamically changing the mesh geometry, because split and merge operations can be done quickly. Their primary drawback is large storage requirements and increased complexity due to maintaining many indices. A good discussion of implementation issues of Winged-edge meshes may be found in the book Graphics Gems II.

Winged-edge meshes address the issue of traversing from edge to edge, and providing an ordered set of faces around an edge. For any given edge, the number of outgoing edges may be arbitrary. To simplify this, winged-edge meshes provide only four, the nearest clockwise and counter-clockwise edges at each end. The other edges may be traversed incrementally. The information for each edge therefore resembles a butterfly, hence "winged-edge" meshes. The above figure shows the "box-cylinder" as a winged-edge mesh. The total data for an edge consists of 2 vertices (endpoints), 2 faces (on each side), and 4 edges (winged-edge).

Rendering of winged-edge meshes for graphics hardware requires generating a Face index list, which is usually done only when the geometry changes. Winged-edge meshes are ideally suited for dynamic geometry, such as subdivision surfaces and interactive modeling, since changes to the mesh can occur locally. Traversal across the mesh, as might be needed for collision detection, can be accomplished efficiently.

See Baumgart (1975) for more details.


### Render dynamic meshes

Winged-edge meshes are not the only representation which allows for dynamic changes to geometry. A new representation which combines winged-edge meshes and face-vertex meshes is the render dynamic mesh, which explicitly stores both, the vertices of a face and faces of a vertex (like FV meshes), and the faces and vertices of an edge (like winged-edge).

Render dynamic meshes requires slightly less storage space than standard winged-edge meshes, and can be directly rendered by graphics hardware since the face list contains an index of vertices. In addition, traversal from vertex to face is explicit (constant time), as is from face to vertex. RD meshes do not require the four outgoing edges since these can be found by traversing from edge to face, then face to neighboring edge.

RD meshes benefit from the features of winged-edge meshes by allowing for geometry to be dynamically updated.

See Tobler & Maierhofer (WSCG 2006) for more details.


### Summary


*[Table: Summary of mesh representation]*

In the above table, explicit indicates that the operation can be performed in constant time, as the data is directly stored; list compare indicates that a list comparison between two lists must be performed to accomplish the operation; and pair search indicates a search must be done on two indices. The notation avg(V,V) means the average number of vertices connected to a given vertex; avg(E,V) means the average number of edges connected to a given vertex, and avg(F,V) is the average number of faces connected to a given vertex.

The notation "V → f1, f2, f3, ... → v1, v2, v3, ..." describes that a traversal across multiple elements is required to perform the operation. For example, to get "all vertices around a given vertex V" using the face-vertex mesh, it is necessary to first find the faces around the given vertex V using the vertex list. Then, from those faces, use the face list to find the vertices around them. Winged-edge meshes explicitly store nearly all information, and other operations always traverse to the edge first to get additional info. Vertex-vertex meshes are the only representation that explicitly stores the neighboring vertices of a given vertex.

As the mesh representations become more complex (from left to right in the summary), the amount of information explicitly stored increases. This gives more direct, constant time, access to traversal and topology of various elements but at the cost of increased overhead and space in maintaining indices properly.

Figure 7 shows the connectivity information for each of the four technique described in this article. Other representations also exist, such as half-edge and corner tables. These are all variants of how vertices, faces and edges index one another.

As a general rule, face-vertex meshes are used whenever an object must be rendered on graphics hardware that does not change geometry (connectivity), but may deform or morph shape (vertex positions) such as real-time rendering of static or morphing objects. Winged-edge or render dynamic meshes are used when the geometry changes, such as in interactive modeling packages or for computing subdivision surfaces. Vertex-vertex meshes are ideal for efficient, complex changes in geometry or topology so long as hardware rendering is not of concern.


## Other representations


## File formats

There exist many different file formats for storing polygon mesh data. Each format is most effective when used for the purpose intended by its creator. Popular formats include .fbx, .dae, .obj, and .stl. A table of some more of these formats is presented below:


## See also


- Boundary representation
- Euler operator
- Hypergraph
- Manifold (a mesh can be manifold or non-manifold)
- Mesh subdivision (a technique for adding detail to a polygon mesh)
- Polygon modeling
- Polygonizer
- Simplex
- T-spline
- Triangulation (geometry)
- Wire-frame model


## External links


- Weisstein, Eric W. "Simplicial complex". MathWorld.
- Weisstein, Eric W. "Triangulation". MathWorld.
- OpenMesh open source half-edge mesh representation.
- Polygon Mesh Processing Library
- Surface Mesh, a chapter of CGAL, the Commputational Geometry Algorithms Library.
