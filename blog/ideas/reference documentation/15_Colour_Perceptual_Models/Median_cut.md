# Median cut

Median cut is an algorithm to sort data of an arbitrary number of dimensions into series of sets by recursively cutting each set of data at the median point along the longest dimension. Median cut is typically used for color quantization. For example, to reduce a 64k-colour image to 256 colours, median cut is used to find 256 colours that match the original data well.


## Implementation of color quantization

Suppose we have an image with an arbitrary number of pixels and want to generate a palette of 16 colors. Put all the pixels of the image (that is, their RGB values) in a bucket. Find out which color channel (red, green, or blue) among the pixels in the bucket has the greatest range, then sort the pixels according to that channel's values. For example, if the blue channel has the greatest range, then a pixel with an RGB value of (32, 8, 16) is less than a pixel with an RGB value of (1, 2, 24), because 16 < 24. After the bucket has been sorted, move the upper half of the pixels into a new bucket. (It is this step that gives the median cut algorithm its name; the buckets are divided into two at the median of the list of pixels.) This process can be repeated to further subdivide the set of pixels: choose a bucket to divide (e.g., the bucket with the greatest range in any color channel) and divide it into two. After the desired number of buckets have been produced, average the pixels in each bucket to get the final color palette.


## See also


- k-d tree


## External links


- Image quantization
- Median cut + variations
- Image::Pngslimmer Perl module at CPAN
- Color image quantization for frame buffer display
