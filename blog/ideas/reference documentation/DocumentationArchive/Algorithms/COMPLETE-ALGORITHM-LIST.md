# Complete Algorithm List for Audit

## EDGE DETECTION (6 algorithms)
1. sobel
2. canny
3. laplacian
4. laplacianOfGaussian
5. differenceOfGaussians
6. structureTensor

## SEGMENTATION (4 algorithms)
7. otsuThreshold
8. applyThreshold
9. connectedComponents
10. floodFill

## SAMPLING (5 algorithms)
11. poissonDisk
12. variablePoissonDisk
13. haltonSequence
14. lloydRelaxation
15. importanceSampling

## SPACE-FILLING CURVES (6 algorithms)
16. HilbertCurve
17. PeanoCurve
18. MooreCurve
19. ZOrderCurve
20. LSystem
21. CurveUtils

## TSP (5 algorithms)
22. nearestNeighbor
23. twoOpt
24. christofides
25. solveTSP
26. computePathLength

## GEOMETRY (5 algorithms)
27. pointInPolygon
28. polygonArea
29. polygonCentroid
30. polygonBounds
31. packSquaresInPolygon

## NOISE FUNCTIONS (9 algorithms)
32. perlin2D
33. simplex2D
34. fbm2D
35. domainWarp2D
36. multiWarp2D
37. smoothstep
38. smootherstep
39. seedNoise
40. mapNoiseRange

## PATTERN GENERATORS (10 algorithms)
41. generateTruchetGrid
42. getTruchetArcs
43. truchetSDF
44. linearGrating
45. radialGrating
46. angularGrating
47. spiralGrating
48. combineMoire
49. superellipse
50. superellipsePoint / superellipsePoints

## HALFTONE PATTERNS (8 algorithms)
51. lineHalftone
52. crossHatchHalftone
53. contourAlignedLattice
54. sizeDotsFromLuminance
55. dyadicHalftone
56. extractLuminance
57. extractNormalMap
58. extractDepthMap

## SDF OPERATIONS (18 algorithms)
59. sdfCircle
60. sdfBox
61. sdfRoundedBox
62. sdfSegment
63. sdfPolygon
64. sdfUnion
65. sdfIntersection
66. sdfSubtraction
67. sdfSmoothUnion
68. sdfSmoothSubtraction
69. sdfSmoothIntersection
70. sdfRepeat
71. sdfRotate
72. sdfRound
73. sdfAnnular
74. evaluateSDFGrid
75. sdfGradient
76. sdfToMask
77. sdfAlpha

## BIN PACKING (5 algorithms)
78. maxRectsPack
79. shelfPack
80. multiBinPack
81. totalArea
82. estimateMinBins

## MARCHING SQUARES (6 algorithms)
83. marchingSquares
84. extractContours
85. extractMultipleContours
86. autoContourLevels
87. contourArea
88. simplifyContour

## SPATIAL INDEX (7 algorithms)
89. buildKdTree
90. kdNearestNeighbor
91. kdRadiusSearch
92. kdKNearestNeighbors
93. createSpatialHash
94. findClosePointPairs
95. nearestSiteGrid

## CURVE GEOMETRY (15 algorithms)
96. computeTangents
97. computeNormals
98. computeCurvature
99. extrudeRibbon
100. ribbonTriangles
101. extrudeWithCurvature
102. depthSortBackToFront
103. depthSortFrontToBack
104. assignDepthFromY
105. sortRibbonTriangles
106. offsetCurve
107. multipleOffsetCurves
108. normalShading
109. rimLighting
110. combinedShading

## ADVECTION (9 algorithms)
111. bilinearSample
112. advectSemiLagrangian
113. advectMacCormack
114. advectParticleEuler
115. advectParticleRK4
116. traceStreamline
117. uniformVelocityField
118. rotationalVelocityField
119. curlNoiseVelocityField

## REACTION-DIFFUSION (9 algorithms)
120. initGrayScott
121. stepGrayScott
122. runGrayScott
123. GRAY_SCOTT_PRESETS
124. stepTuringPattern
125. stepGameOfLife
126. stepCellularAutomaton
127. CA_RULES
128. initCellularAutomaton

## WAVE SOLVER (9 algorithms)
129. initWave1D
130. stepWave1D
131. impulseWave1D
132. initWave2D
133. stepWave2D
134. rippleWave2D
135. travellingWave
136. standingWave
137. waveEnergy

## JFA / DISTANCE TRANSFORMS (6 algorithms)
138. jfaInitialize
139. jfaPass
140. jumpFloodAlgorithm
141. jfaToDistanceField
142. jfaSignedDistanceField
143. jfaVoronoi

## GEODESIC DISTANCE (4 algorithms)
144. fastMarchingGeodesic
145. geodesicWithObstacles
146. solveLaplace
147. harmonicInterpolation

## OPTICS / INTERFERENCE (12 algorithms)
148. opticalPathLength
149. opdToPhase
150. twoBeamInterference
151. thinFilmOPD
152. thinFilmOPDAngle
153. thinFilmReflectance
154. thinFilmColor
155. birefringentRetardation
156. crossedPolarIntensity
157. uniaxialConoscopy
158. conoscopicColor
159. wavelengthToRGB
160. retardationToMichelLevy

## HOG FEATURES (6 algorithms)
161. computeGradients
162. buildCellHistogram
163. normalizeHistogram
164. computeHOG
165. compareHOG
166. hogVisualizationData

## POSTERIZATION (11 algorithms)
167. posterize
168. posterizeGamma
169. posterizeSmooth
170. posterizeCustom
171. histogramOptimalLevels
172. posterizeImage
173. posterizeImageRGB
174. posterizeImageLuminance
175. posterizeDither
176. posterizeImageBayer
177. extractPosterContours

## IMAGE ANALYSIS (7 algorithms)
178. analyzeGlyph
179. computeOrientationHistogram
180. analyzeGlyphSet
181. matchGlyph
182. hammingDistance
183. coherenceSmoothing
184. edgePreservingSmoothing

## AUDIO / WAV ENCODER (12 algorithms)
185. createWavHeader
186. encodeWavMono
187. encodeWavStereo
188. createWavBlob
189. createWavUrl
190. generateSine
191. generateSquare
192. generateSawtooth
193. generateTriangle
194. generateNoise
195. applyEnvelope
196. mixTracks

## DSP EVALUATOR (4 algorithms)
197. parseEquation
198. evaluateEquation
199. validateEquation
200. getEquationVariables

## COORDINATE TRANSFORMS (11 algorithms)
201. cartesianToPolar
202. polarToCartesian
203. linearToCircular
204. waveformToCircular
205. rectangularToPolar
206. polarToRectangular
207. waveformToPath
208. lissajousFigure
209. oscilloscopeTrail
210. rotatePoint
211. scalePoint
212. fishEye
213. barrelDistortion

## ANIMATION (8 algorithms)
214. LFO_WAVEFORM
215. createLFO
216. combineLFOs
217. loopTime
218. pingpong
219. loopingNoise1D
220. keyframeLoop
221. Easing
222. morphLayout
223. staggeredTime
224. createSpring

## RENDERING (14 algorithms)
225. createSpriteCache
226. createOffscreenBuffer
227. calculate3DShading
228. renderBeveledTile
229. renderRimHighlight
230. createBatchRenderer
231. createDirtyRegionTracker
232. jitteredGridSamples
233. stratifiedSamples
234. fieldToImageData
235. renderScalarField
236. metaballField
237. renderMetaballs
238. renderBlobs
239. renderConcentricContours
240. renderDistanceContours

**TOTAL: 240 algorithms/functions**

Note: Many are helper/utility functions. Core algorithms ≈ 150

