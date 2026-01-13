# Random walker algorithm

The random walker algorithm is an algorithm for image segmentation. In the first description of the algorithm, a user interactively labels a small number of pixels with known labels (called seeds), e.g., "object" and "background". The unlabeled pixels are each imagined to release a random walker, and the probability is computed that each pixel's random walker first arrives at a seed bearing each label, i.e., if a user places K seeds, each with a different label, then it is necessary to compute, for each pixel, the probability that a random walker leaving the pixel will first arrive at each seed. These probabilities may be determined analytically by solving a system of linear equations. After computing these probabilities for each pixel, the pixel is assigned to the label for which it is most likely to send a random walker. The image is modeled as a graph, in which each pixel corresponds to a node which is connected to neighboring pixels by edges, and the edges are weighted to reflect the similarity between the pixels. Therefore, the random walk occurs on the weighted graph (see Doyle and Snell for an introduction to random walks on graphs).

Although the initial algorithm was formulated as an interactive method for image segmentation, it has been extended to be a fully automatic algorithm, given a data fidelity term (e.g., an intensity prior). It has also been extended to other applications.

The algorithm was initially published by Leo Grady as a conference paper and later as a journal paper.


## Mathematics

Although the algorithm was described in terms of random walks, the probability that each node sends a random walker to the seeds may be calculated analytically by solving a sparse, positive-definite system of linear equations with the graph Laplacian matrix, which we may represent with the variable $L$. The algorithm was shown to apply to an arbitrary number of labels (objects), but the exposition here is in terms of two labels (for simplicity of exposition).

Assume that the image is represented by a graph, with each node $v_{i}$ associated with a pixel and each edge $e_{ij}$ connecting neighboring pixels $v_{i}$ and $v_{j}$. The edge weights are used to encode node similarity, which may be derived from differences in image intensity, color, texture or any other meaningful features. For example, using image intensity $g_{i}$ at node $v_{i}$, it is common to use the edge weighting function


$$w_{ij}=\exp {\left(-\beta (g_{i}-g_{j})^{2}\right)}.
$$

The nodes, edges and weights can then be used to construct the graph Laplacian matrix.

The random walker algorithm optimizes the energy


$$Q(x)=x^{T}Lx=\sum _{e_{ij}}w_{ij}\left(x_{i}-x_{j}\right)^{2}
$$

where $x_{i}$ represents a real-valued variable associated with each node in the graph and the optimization is constrained by $x_{i}=1$ for $v_{i}\in F$ and $x_{i}=0$ for $v_{i}\in B$, where $F$ and $B$ represent the sets of foreground and background seeds, respectively. If we let $S$ represent the set of nodes which are seeded (i.e., $S=F\cup B$) and ${\overline {S}}$ represent the set of unseeded nodes (i.e., $S\cup {\overline {S}}=V$ where $V$ is the set of all nodes), then the optimum of the energy minimization problem is given by the solution to


$$L_{{\overline {S}},{\overline {S}}}x_{\overline {S}}=-L_{{\overline {S}},S}x_{S},
$$

where the subscripts are used to indicate the portion of the graph Laplacian matrix $L$ indexed by the respective sets.

To incorporate likelihood (unary) terms into the algorithm, it was shown in that one may optimize the energy


$$Q(x)=x^{T}Lx+\gamma \left((1-x)^{T}F(1-x)+x^{T}Bx\right)=\sum _{e_{ij}}w_{ij}\left(x_{i}-x_{j}\right)^{2}+\gamma \left(\sum _{v_{i}}f_{i}(1-x_{i})^{2}+\sum _{v_{i}}b_{i}x_{i}^{2}\right),
$$

for positive, diagonal matrices $F$ and $B$. Optimizing this energy leads to the system of linear equations


$$\left(L_{{\overline {S}},{\overline {S}}}+\gamma F_{{\overline {S}},{\overline {S}}}+\gamma B_{{\overline {S}},{\overline {S}}}\right)x_{\overline {S}}=-L_{{\overline {S}},S}x_{S}-\gamma F_{{\overline {S}},{\overline {S}}}.
$$

The set of seeded nodes, $S$, may be empty in this case (i.e., ${\overline {S}}=V$), but the presence of the positive diagonal matrices allows for a unique solution to this linear system.

For example, if the likelihood/unary terms are used to incorporate a color model of the object, then $f_{i}$ would represent the confidence that the color at node $v_{i}$ would belong to object (i.e., a larger value of $f_{i}$ indicates greater confidence that $v_{i}$ belonged to the object label) and $b_{i}$ would represent the confidence that the color at node $v_{i}$ belongs to the background.


## Algorithm interpretations

The random walker algorithm was initially motivated by labelling a pixel as object/background based on the probability that a random walker dropped at the pixel would first reach an object (foreground) seed or a background seed. However, there are several other interpretations of this same algorithm which have appeared in.


### Circuit theory interpretations

There are well-known connections between electrical circuit theory and random walks on graphs. Consequently, the random walker algorithm has two different interpretations in terms of an electric circuit. In both cases, the graph is viewed as an electric circuit in which each edge is replaced by a passive linear resistor. The resistance, $r_{ij}$, associated with edge $e_{ij}$ is set equal to
$$r_{ij}={\frac {1}{w_{ij}}}
$$(i.e., the edge weight equals electrical conductance).

In the first interpretation, each node associated with a background seed, $v_{i}\in B$, is tied directly to ground while each node associated with an object/foreground seed, $v_{i}\in F$ is attached to a unit direct current ideal voltage source tied to ground (i.e., to establish a unit potential at each $v_{i}\in F$). The steady-state electrical circuit potentials established at each node by this circuit configuration will exactly equal the random walker probabilities. Specifically, the electrical potential, $x_{i}$ at node $v_{i}$ will equal the probability that a random walker dropped at node $v_{i}$ will reach an object/foreground node before reaching a background node.

In the second interpretation, labeling a node as object or background by thresholding the random walker probability at 0.5 is equivalent to labeling a node as object or background based on the relative effective conductance between the node and the object or background seeds. Specifically, if a node has a higher effective conductance (lower effective resistance) to the object seeds than to the background seeds, then node is labeled as object. If a node has a higher effective conductance (lower effective resistance) to the background seeds than to the object seeds, then node is labeled as background.


## Extensions

The traditional random walker algorithm described above has been extended in several ways:


- Random walks with restart
- Alpha matting
- Threshold selection
- Soft inputs
- Run on a presegmented image
- Scale space random walk
- Fast random walker using offline precomputation
- Generalized random walks allowing flexible compatibility functions
- Power watersheds unifying graph cuts, random walker and shortest path
- Random walker watersheds
- Multivariate Gaussian conditional random field


## Applications

Beyond image segmentation, the random walker algorithm or its extensions has been additionally applied to several problems in computer vision and graphics:


- Image Colorization
- Interactive rotoscoping
- Medical image segmentation
- Merging multiple segmentations
- Mesh segmentation
- Mesh denoising
- Segmentation editing
- Shadow elimination
- Stereo matching (i.e., one-dimensional image registration)
- Image fusion


## External links


- Matlab code implementing the original random walker algorithm
- Matlab code implementing the random walker algorithm with precomputation
- Python implementation of the original random walker algorithm Archived 2012-10-14 at the Wayback Machine in the image processing toolbox scikit-image
