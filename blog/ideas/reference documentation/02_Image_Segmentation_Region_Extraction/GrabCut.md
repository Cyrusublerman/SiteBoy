# GrabCut

GrabCut is an image segmentation method based on graph cuts.

Starting with a user-specified bounding box around the object to be segmented, the algorithm estimates the color distribution of the target object and that of the background using a Gaussian mixture model. This is used to construct a Markov random field over the pixel labels, with an energy function that prefers connected regions having the same label, and running a graph cut based optimization to infer their values. As this estimate is likely to be more accurate than the original, taken from the bounding box, this two-step procedure is repeated until convergence.

Estimates can be further corrected by the user by pointing out misclassified regions and rerunning the optimization. The method also corrects the results to preserve edges.

There are several open source implementations available including OpenCV (as of version 2.1).


## See also


- Connectivity (graph theory)
- Prim's algorithm
- Edmonds–Karp algorithm
- Graph cuts in computer vision
