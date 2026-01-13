# Connected-component labeling

Connected-component labeling (CCL), connected-component analysis (CCA), blob extraction, region labeling, blob discovery, or region extraction is an algorithmic application of graph theory, where subsets of connected components are uniquely labeled based on a given heuristic. Connected-component labeling is not to be confused with segmentation.

Connected-component labeling is used in computer vision to detect connected regions in binary digital images, although color images and data with higher dimensionality can also be processed. When integrated into an image recognition system or human-computer interaction interface, connected component labeling can operate on a variety of information. Blob extraction is generally performed on the resulting binary image from a thresholding step, but it can be applicable to gray-scale and color images as well. Blobs may be counted, filtered, and tracked.

Blob extraction is related to but distinct from blob detection.


## Overview

A graph, containing vertices and connecting edges, is constructed from relevant input data. The vertices contain information required by the comparison heuristic, while the edges indicate connected 'neighbors'. An algorithm traverses the graph, labeling the vertices based on the connectivity and relative values of their neighbors. Connectivity is determined by the medium; image graphs, for example, can be 4-connected neighborhood or 8-connected neighborhood.

Following the labeling stage, the graph may be partitioned into subsets, after which the original information can be recovered and processed .


## Definition

The usage of the term connected-components labeling (CCL) and its definition is quite consistent in the academic literature, whereas connected-components analysis (CCA) varies in terms of both terminology and problem definition.

Rosenfeld et al. define connected components labeling as the “[c]reation of a labeled image in which the positions associated with the same connected component of the binary input image have a unique label.” Shapiro et al. define CCL as an operator whose “input is a binary image and [...] output is a symbolic image in which the label assigned to each pixel is an integer uniquely identifying the connected component to which that pixel belongs.”

There is no consensus on the definition of CCA in the academic literature. It is often used interchangeably with CCL. A more extensive definition is given by Shapiro et al.: “Connected component analysis consists of connected component labeling of the black pixels followed by property measurement of the component regions and decision making.” The definition for connected-component analysis presented here is more general, taking the thoughts expressed in into account.


## Algorithms

The algorithms discussed can be generalised to arbitrary dimensions, albeit with increased time and space complexity.


### One component at a time

This is a fast and very simple method to implement and understand. It is based on graph traversal methods in graph theory. In short, once the first pixel of a connected component is found, all the connected pixels of that connected component are labelled before going onto the next pixel in the image. This algorithm is part of Vincent and Soille's watershed segmentation algorithm, other implementations also exist.

In order to do that a linked list is formed that will keep the indexes of the pixels that are connected to each other, steps (2) and (3) below. The method of defining the linked list specifies the use of a depth or a breadth first search. For this particular application, there is no difference which strategy to use. The simplest kind of a last in first out queue implemented as a singly linked list will result in a depth first search strategy.

It is assumed that the input image is a binary image, with pixels being either background or foreground and that the connected components in the foreground pixels are desired. The algorithm steps can be written as:


1. Start from the first pixel in the image. Set current label to 1. Go to (2).
2. If this pixel is a foreground pixel and it is not already labelled, give it the current label and add it as the first element in a queue, then go to (3). If it is a background pixel or it was already labelled, then repeat (2) for the next pixel in the image.
3. Pop out an element from the queue, and look at its neighbours (based on any type of connectivity). If a neighbour is a foreground pixel and is not already labelled, give it the current label and add it to the queue. Repeat (3) until there are no more elements in the queue.
4. Go to (2) for the next pixel in the image and increment current label by 1.

Note that the pixels are labelled before being put into the queue. The queue will only keep a pixel to check its neighbours and add them to the queue if necessary. This algorithm only needs to check the neighbours of each foreground pixel once and doesn't check the neighbours of background pixels.

The pseudocode is:


### Two-pass

Relatively simple to implement and understand, the two-pass algorithm, (also known as the Hoshen–Kopelman algorithm) iterates through 2-dimensional binary data. The algorithm makes two passes over the image: the first pass to assign temporary labels and record equivalences, and the second pass to replace each temporary label by the smallest label of its equivalence class.

The input data can be modified in situ (which carries the risk of data corruption), or labeling information can be maintained in an additional data structure.

Connectivity checks are carried out by checking neighbor pixels' labels (neighbor elements whose labels are not assigned yet are ignored), or say, the north-east, the north, the north-west and the west of the current pixel (assuming 8-connectivity). 4-connectivity uses only north and west neighbors of the current pixel. The following conditions are checked to determine the value of the label to be assigned to the current pixel (4-connectivity is assumed)

Conditions to check:


1. Does the pixel to the left (west) have the same value as the current pixel? Yes – We are in the same region. Assign the same label to the current pixel No – Check next condition
2. Do both pixels to the north and west of the current pixel have the same value as the current pixel but not the same label? Yes – We know that the north and west pixels belong to the same region and must be merged. Assign the current pixel the minimum of the north and west labels, and record their equivalence relationship No – Check next condition
3. Does the pixel to the left (west) have a different value and the one to the north the same value as the current pixel? Yes – Assign the label of the north pixel to the current pixel No – Check next condition
4. Do the pixel's north and west neighbors have different pixel values than current pixel? Yes – Create a new label id and assign it to the current pixel

The algorithm continues this way, and creates new region labels whenever necessary. The key to a fast algorithm, however, is how this merging is done. This algorithm uses the union-find data structure which provides excellent performance for keeping track of equivalence relationships. Union-find essentially stores labels which correspond to the same blob in a disjoint-set data structure, making it easy to remember the equivalence of two labels by the use of an interface method E.g.: findSet(l). findSet(l) returns the minimum label value that is equivalent to the function argument 'l'.

Once the initial labeling and equivalence recording is completed, the second pass merely replaces each pixel label with its equivalent disjoint-set representative element.

A faster-scanning algorithm for connected-region extraction is presented below.

On the first pass:


1. Iterate through each element of the data by column, then by row (Raster Scanning)
2. If the element is not the background Get the neighboring elements of the current element If there are no neighbors, uniquely label the current element and continue Otherwise, find the neighbor with the smallest label and assign it to the current element Store the equivalence between neighboring labels

On the second pass:


1. Iterate through each element of the data by column, then by row
2. If the element is not the background Relabel the element with the lowest equivalent label

Here, the background is a classification, specific to the data, used to distinguish salient elements from the foreground. If the background variable is omitted, then the two-pass algorithm will treat the background as another region.


## Graphical example of two-pass algorithm

1. The array from which connected regions are to be extracted is given below (8-connectivity based).

We first assign different binary values to elements in the graph. The values "0~1" at the center of each of the elements in the following graph are the elements' values, whereas the "1,2,...,7" values in the next two graphs are the elements' labels. The two concepts should not be confused.

2. After the first pass, the following labels are generated:

A total of 7 labels are generated in accordance with the conditions highlighted above.

The label equivalence relationships generated are,

3. Array generated after the merging of labels is carried out. Here, the label value that was the smallest for a given region "floods" throughout the connected region and gives two distinct labels, and hence two distinct labels.

4. Final result in color to clearly see two different regions that have been found in the array.

The pseudocode is:

The find and union algorithms are implemented as described in union find.


### Sequential algorithm

Create a region counter

Scan the image (in the following example, it is assumed that scanning is done from left to right and from top to bottom):


- For every pixel check the north and west pixel (when considering 4-connectivity) or the northeast, north, northwest, and west pixel for 8-connectivity for a given region criterion (i.e. intensity value of 1 in binary image, or similar intensity to connected pixels in gray-scale image).
- If none of the neighbors fit the criterion then assign to region value of the region counter. Increment region counter.
- If only one neighbor fits the criterion assign pixel to that region.
- If multiple neighbors match and are all members of the same region, assign pixel to their region.
- If multiple neighbors match and are members of different regions, assign pixel to one of the regions (it doesn't matter which one). Indicate that all of these regions are equivalent.
- Scan image again, assigning all equivalent regions the same region value.


## Others

Some of the steps present in the two-pass algorithm can be merged for efficiency, allowing for a single sweep through the image. Multi-pass algorithms also exist, some of which run in linear time relative to the number of image pixels.

In the early 1990s, there was considerable interest in parallelizing connected-component algorithms in image analysis applications, due to the bottleneck of sequentially processing each pixel.

The interest to the algorithm arises again with an extensive use of CUDA.


### Pseudocode for the one-component-at-a-time algorithm


1. Connected-component matrix is initialized to size of image matrix.
2. A mark is initialized and incremented for every detected object in the image.
3. A counter is initialized to count the number of objects.
4. A row-major scan is started for the entire image.
5. If an object pixel is detected, then following steps are repeated while (Index !=0) Set the corresponding pixel to 0 in Image. A vector (Index) is updated with all the neighboring pixels of the currently set pixels. Unique pixels are retained and repeated pixels are removed. Set the pixels indicated by Index to mark in the connected-component matrix.
6. Increment the marker for another object in the image.

The run time of the algorithm depends on the size of the image and the amount of foreground. The time complexity is comparable to the two pass algorithm if the foreground covers a significant part of the image. Otherwise the time complexity is lower. However, memory access is less structured than for the two-pass algorithm, which tends to increase the run time in practice.


## Performance evaluation

In the last two decades many novel approaches to connected-component labeling have been proposed, but almost none of them have been subjected to a comparative performance assessment using the same data set. YACCLAB (acronym for Yet Another Connected Components Labeling Benchmark) is an example of C++ open source framework which collects, runs, and tests connected-component labeling algorithms.


## Hardware architectures

The emergence of FPGAs with enough capacity to perform complex image processing tasks also led to high-performance architectures for connected-component labeling. Most of these architectures utilize the single pass variant of this algorithm, because of the limited memory resources available on an FPGA. These types of connected component labeling architectures can process several image pixels in parallel, thereby achieving high throughput and low processing latency.


## See also


- Feature extraction
- Flood fill


### General


- Horn, Berthold K.P. (1986). Robot Vision. MIT Press. pp. 69–71. ISBN 978-0-262-08159-7.


- Al Bovik (2000). HandBook for Image and Video processing (PDF). Academic Press. pp. [37–70]. ISBN 0-12-119790-5.


## External links


- Implementation in C#
- about Extracting objects from image and Direct Connected Component Labeling Algorithm
