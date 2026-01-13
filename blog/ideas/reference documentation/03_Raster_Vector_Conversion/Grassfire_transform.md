# Grassfire transform

In image processing, the grassfire transform is the computation of the distance from a pixel to the border of a region. It can be described as "setting fire" to the borders of an image region to yield descriptors such as the region's skeleton or medial axis. Harry Blum introduced the concept in 1967.


## Motivation

A region's skeleton can be a useful descriptor, because it describes things such as the symmetry of the region as well as subparts, depressions and protrusions. It also provides a way of relating the interior of a region to the shape of the boundary. In the grassfire transform, the skeleton forms at the points in the region where the "fires" meet. In the literature this is described as the locus of meeting waveforms.

Another advantage of using the outcome of the grassfire transform as a descriptor is that it is invertible. Assuming information about when the medial axis or skeleton is created by meeting waveforms is kept, then the skeleton can be restored by radiating outward.


## Example algorithm

The algorithm below is a simple two pass method for computing the Manhattan distance from the border of a region. Of course there are several other algorithms for performing the grassfire transform.

Below is the result of this transform. It is important to note that the most intense lines make up the skeleton.


## Applications

The grassfire transform can be abstracted to suit a variety of computing problems. It has been shown that it can be extended beyond the context of images to arbitrary functions. This includes applications in energy minimization problems such as those handled by the Viterbi algorithm, max-product belief propagation, resource allocation, and in optimal control methods.

It can also be used to compute the distance between regions by setting the background to be as a region.


## See also


- Topological skeleton
- Distance transform
