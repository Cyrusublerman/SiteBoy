# INPUT
We could either input an image (jpeg or similar) or a vector (svg)

## Processing - Initial
If it was a non vector we need to process to identify boundaries. 
 - some images it would be better to identify by changes in colour
 - some would be better by lightness
 - some would be better by some sort of weighted sum of HSL
 - what are typical ways in which images are converted to line art?
 - should we also have a way to manually draw the vectors over the top?
 - should we also have a way to upload a vector mask
- we can use the colour information as modulation variables to control the space filling algorithms
	- Separate either as R, G, B or HSL or whatever
- can we determine direction of shading (or difference of any value)
	- can we compare trends in the variance of values to find vectors of movement?
- should end this section with:
	- enclosed vector shapes to be filled
		- potential that some vectors are enclosed by others, if so then we need to layer these vectors so that all vectors are made from single continuous lines. This also may be an optional toggle as I can see use for having the filling take into account the holes. So then I guess we need either a stacked array of single line vectors or vectors with holes that are all on the same level
	- extracted images for modulating variables (such as line thickness or density) (this will be a set depending on how we separate image information)
	- pure line information (all curves?)
	- original image

## Space Filling

There are numerous methods of space filling with lines such as fractal space filling curves, L-systems, flood fill algorithms, reaction diffusion algorithms, self avoiding walks and the travelling salesman. 

a collection of documentation on it is here: \blog\ideas\reference documentation\space filling

Many of these algorithms have serious limitations with the shapes they can work with:

If they need Squares:
 - we can determine a resolution and break the image into a grid;
 - then using this grid we can pack the vectors with squares (optimise for highest average size square);
 - smallest square is limited by the resolution
 - cull all squares with a point outside of the vector
 - now use these squares as the housing for the space filling curves (like hilbert)
 - the lines generated need to be all linked together so we will have to figure out how to orient the curves inside the squares to make as many link together as possible. 
 - if there are still ends that are loose then we need an option to extend them until they intersect a line or touch a point. 
   
If they Need Other Polygon:
 - follow the same steps as the squares but adjust for that polygon
 - so if needing to be a triangle then triangulate vector

Potential to mix:
 - There is a potential to mix the algorithms to adjust to the complex shapes better
 - if we use squares initially there will be empty space between the outer squares and the vector edge. this can be triangulated. 

Travelling salesman:
	- This is a relatively straightforward method of filling the space with one line
	- there are many ways of distributing points in the vectors. 
	- techniques found here: C:\Users\Einod\Documents\GitHub\SiteBoy\blog\ideas\reference documentation\Point Distribution

Reaction-Diffusion
If we have some sort of cell-growth or Brownian motion like algorithm that spreads a gradient out until it fills the whole space, we can then map the time / iterations it took to get to a point to values (0, 1). using this we have a gradient that we can find the vector for and use these vectors to guide line creation. 
We would need a methodology for connecting the different separated lines. 
We could also use the 
## Modulation


Depending on the space filling algorithm there are many different things that can be modulated. 

### line width
if all space filling curves that are joined into lines then we can alter the width of the lines depending on a corresponding variable tied to that point. this will need to be controlled and managed so we don't get any sharp changes. 
	- we could map per pixel and then mix each point with the points before and after, if this process was looped it would smooth more and more, essentially giving us a smoothing variable we can control
	- we could also blur the modulating image and it would do the same thing essentially
### Line Density
Many of the L-system and fractal curves have a factor that makes the lines denser and denser, this can be controlled by a modulation image. 

techniques to do this well could vary. Instinctively I would think that we follow the mechanism of the how the fractal curves get denser each iteration, each time subdividing the area. At each subdivision we could find the average modulation value for each of the subdivisions and then use that to determine whether that subdivision gets iterated on again. This may make us lose definition, especially if there is a small detail in a large area of light colour. Different mechanisms for blurring the modulation image for each iteration could help this though. If we were to have high blur for the low resolution curve formation and for each subdivision have less and less blur it could give us access to those smaller sections.

for space filling algorithms like the travelling salesmen, the density is dictated by the point density that we use the point distribution methods for. therefore modulation of density would be at that level, altering how many points are in a given area based on the modulation image. 

If we 