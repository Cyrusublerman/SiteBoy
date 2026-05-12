## Usage

Paste each script into the Blender **Text Editor** and run. Scripts create Collections: `points`, `lattice`, `joints`, `topLine`, `leaf ` (note trailing space), `leafVert`, `bottom`. Units are metres. Materials referenced in code (`Brass`, `Smudged Glass`, `Stainless Steel`, `pole1`) must exist in the file before running.

**Run order:** Main Generator → Negative Space / Leaf Generator → Leaf Object Adder (optional).

## Script 1: Main Generator

Input parameters are at the top of the file. Key controls:

- `radius`, `height`, `pointNumber`: dome geometry.
- `vertNum`, `horizNum`: lattice denominators (N1, N2) — use adjacent Fibonacci pairs (e.g. 21/34, 34/55).
- `jointDiam`, `jointLength`, `poleRad`: fabrication dimensions.
- `leafGen`: set to `1` to generate flat leaves, `0` to generate vertex-only leaf positions for the object adder.
- `topLineOrFlat`: `True` for a flat cap polygon, `False` for converging struts to the apex.

```python
import bpy, bmesh
import numpy as np
import math
import os
import pprint

#==================== INPUT ====================
# All dimensions in metres
radius = 3
height = 3
pointNumber = 610
jointDiam = 0.015
jointLength = jointDiam * 4
poleRad = 0.01
vertNum = 21
horizNum = 34
leafGen = 0
topLineOrFlat = True
topPoint = [0.0, 0.0, height]

pp = pprint.pprint

def deselect():
    for obj in bpy.data.objects:
        obj.select_set(False)

def asCartesian(rthetaphi):
    r     = rthetaphi[0]
    theta = rthetaphi[1] * np.pi / 180
    phi   = rthetaphi[2] * np.pi / 180
    x = r * np.sin(theta) * np.cos(phi)
    y = r * np.sin(theta) * np.sin(phi)
    z = r * np.cos(theta)
    return [x, y, z]

def asSpherical(xyz):
    x = xyz[0]
    y = xyz[1]
    z = xyz[2]
    r     = np.sqrt(x*x + y*y + z*z)
    theta = np.arccos(z / r) * 180 / np.pi
    phi   = np.arctan2(y, x) * 180 / np.pi
    return [r, theta, phi]

def setMat(matName):
    mat = bpy.data.materials.get(matName)
    for o in bpy.context.selected_objects:
        if o.data.materials:
            o.data.materials[0] = mat
        else:
            o.data.materials.append(mat)

def makeLine(start, end, radiusX, radiusY, name, collection, material=None):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radiusX
    spline = curve.splines.new('POLY')
    spline.points.add(1)
    spline.points[0].co = (*start, 1)
    spline.points[1].co = (*end, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.data.collections[collection].objects.link(obj)
    if material:
        deselect()
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        setMat(material)
    return obj

def sphereAtJoint(location, name, collection, material, scale=1.0):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=jointDiam * scale, location=location)
    obj = bpy.context.active_object
    obj.name = name
    for coll in obj.users_collection:
        coll.objects.unlink(obj)
    bpy.data.collections[collection].objects.link(obj)
    if material:
        setMat(material)
    return obj

def distanceFromCenter(point):
    return (point[0]**2 + point[1]**2)**0.5

#==================== POINT FIELD ====================
goldenAngle = 360.0 / ((1 + 5**0.5) / 2)**2  # ~137.508 degrees
C = radius / pointNumber**0.5

points = []
for k in range(1, pointNumber + 1):
    r = C * k**0.5
    theta = k * goldenAngle
    z = height * (1 - k / pointNumber)
    cart = asCartesian([r, 90 - math.degrees(math.atan2(z, r)), theta % 360])
    cart[2] = z
    points.append(cart)

#==================== LATTICE ====================
# Connect every vertNum-th and horizNum-th point to form crossing arch families
for k in range(len(points)):
    for step in [vertNum, horizNum]:
        if k + step < len(points):
            start = points[k]
            end   = points[k + step]
            name  = "lat {} {}".format(k, step)
            makeLine(start, end, poleRad, poleRad, name, "lattice", "Stainless Steel")

#==================== JOINTS ====================
# Build joint arm list per node from neighbour vectors
joints2Angles = []
for k in range(len(points)):
    origin = points[k]
    arms = [origin]
    for step in [vertNum, -vertNum, horizNum, -horizNum]:
        ni = k + step
        if 0 <= ni < len(points):
            nb = points[ni]
            arms.append(asSpherical([nb[0]-origin[0], nb[1]-origin[1], nb[2]-origin[2]]))
    joints2Angles.append(arms)

jointNum = 1
for j in joints2Angles:
    origin = j[0]
    ji = 1
    deselect()
    toJoin = []
    while ji < len(j):
        start = origin
        end = asCartesian(j[ji])
        end[0] += start[0]
        end[1] += start[1]
        end[2] += start[2]
        name2 = "join {} {}".format(jointNum, ji)
        toJoin.append(name2)
        makeLine(start, end, jointDiam, jointDiam, name2, "joints", "Brass")
        ji += 1
    joinName = "join {} c".format(jointNum)
    sphereAtJoint(origin, joinName, "joints", "Brass", 1.2)
    deselect()
    toJoin.append(joinName)
    jointNum += 1

#==================== BOTTOM LEGS ====================
bottomJoints = [points[k] for k in range(len(points)) if points[k][2] < height * 0.1]
bj = 0
for b in bottomJoints:
    start = b
    end = [start[0], start[1], 0]
    name = "bottom pole {}".format(bj)
    makeLine(start, end, poleRad, poleRad, name, "bottom", "Stainless Steel")
    bj += 1

#==================== TOP CAP ====================
topPieces = [asSpherical(p) for p in points if p[2] > height * 0.85]

def takeX(elem):
    return elem[2]

topPieces.sort(key=takeX)
top2 = []
vP = 0
t = 0
while t < len(topPieces) - 1:
    start = asCartesian(topPieces[t])
    top2.append(start)
    end = asCartesian(topPieces[t + 1])
    name = "poleTop {}".format(vP)
    if not topLineOrFlat:
        makeLine(start, [0, 0, height], poleRad, poleRad, name, "topLine", "Stainless Steel")
    t += 1
    vP += 1

top2.append(end)
if top2 and topLineOrFlat:
    edges = [[i, i + 1] for i in range(len(top2) - 1)]
    edges.append([edges[-1][1], edges[0][0]])
    vert = top2 + [[0, 0, height]]
    faces = [[i, i + 1, len(top2) - 1] for i in range(len(top2))]
    faces.append([len(vert) - 1, len(vert) - 2, 0])
    mesh = bpy.data.meshes.new("topmesh")
    mesh.from_pydata(vert, edges, faces)
    mesh.update()
    obj = bpy.data.objects.new("topob", mesh)
    bpy.context.collection.objects.link(obj)
    deselect()
    bpy.context.view_layer.objects.active = bpy.data.objects["topob"]
    setMat("pole1")
    o = bpy.context.active_object
    o.modifiers.new('Solidify', 'SOLIDIFY')
    bpy.context.object.modifiers["Solidify"].offset = 0.7
    bpy.context.object.modifiers["Solidify"].thickness = 0.05
```

## Script 2: Negative Space / Leaf Generator

Generates the trapezoidal infill leaves between lattice nodes. Runs after Script 1.

```python
import bpy, bmesh
import numpy as np
import math
import pprint

pp = pprint.pprint

def deselect():
    for obj in bpy.data.objects:
        obj.select_set(False)

def asSpherical(xyz):
    x = xyz[0]; y = xyz[1]; z = xyz[2]
    r     = np.sqrt(x*x + y*y + z*z)
    theta = np.arccos(z / r) * 180 / np.pi
    phi   = np.arctan2(y, x) * 180 / np.pi
    return [r, theta, phi]

def setMat(matName):
    mat = bpy.data.materials.get(matName)
    for o in bpy.context.selected_objects:
        if o.data.materials:
            o.data.materials[0] = mat
        else:
            o.data.materials.append(mat)

def makeLine(start, end, radiusX, radiusY, name, collection):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radiusX
    spline = curve.splines.new('POLY')
    spline.points.add(1)
    spline.points[0].co = (*start, 1)
    spline.points[1].co = (*end, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.data.collections[collection].objects.link(obj)
    return obj

def takeX(elem):
    return elem[2]

def distanceFromCenter(point):
    return (point[0]**2 + point[1]**2)**0.5

# Retrieve point list from scene (assumes points stored as empty objects in "points" collection)
points = []
for obj in sorted(bpy.data.collections["points"].objects, key=lambda o: o.name):
    points.append(list(obj.location))

vertNum  = 21
horizNum = 34
leafGen  = 1
leafNumber = 0

holeLeaves = []

for k in range(len(points)):
    a = k
    b = k + vertNum
    c = k + vertNum + horizNum
    d = k + horizNum
    if all(i < len(points) for i in [b, c, d]):
        verts = [points[a], points[b], points[c], points[d]]
        name = "leaf {}".format(leafNumber)
        frameName = "frame {}".format(name)

        if leafGen > 0:
            edges = [[i, i+1] for i in range(len(verts)-1)]
            edges.append([0, len(verts)-1])
            faces = [[i for i in range(len(verts))]]
            mesh = bpy.data.meshes.new(name)
            mesh.from_pydata(verts, edges, faces)
            mesh.update()
            o = bpy.data.objects.new(name, mesh)
            bpy.data.collections["leaf "].objects.link(o)
            mod = o.modifiers.new("Solidify", 'SOLIDIFY')
            mod.offset = 0
            mod.thickness = 0.0002
            deselect()
        else:
            # Vertex-only: positions for the object adder
            mesh = bpy.data.meshes.new(name)
            mesh.from_pydata(verts, [], [])
            mesh.update()
            o = bpy.data.objects.new(name, mesh)
            bpy.data.collections["leafVert"].objects.link(o)

        leafNumber += 1

# Assign materials to leaf collection
for obj in bpy.data.collections["leaf "].objects:
    deselect()
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    if "frame" in obj.name:
        setMat("Brass")
    else:
        setMat("Smudged Glass")
    deselect()

# Apex hole leaves: fill remaining trapezoids at the top with topPoint
topPoint = [0.0, 0.0, bpy.data.objects["topob"].location[2] if "topob" in bpy.data.objects else 3.0]
vertMod = 0.1
for leaf in holeLeaves:
    if len(leaf) > 3:
        if distanceFromCenter(leaf[3]) < distanceFromCenter(leaf[0]):
            leaf.pop(0)
            leaf.pop(0)
            leaf.append(topPoint)
    vert = leaf
    if leafGen > 0:
        edges = [[i, i+1] for i in range(len(vert)-1)]
        edges.append([0, len(vert)-1])
        faces = [[i for i in range(len(vert))]]
        name = "holeLeaf {}".format(leafNumber)
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vert, edges, faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.data.collections["leaf "].objects.link(obj)
    else:
        vert.sort(key=takeX)
        name = "holeLeafVert {}".format(leafNumber)
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vert, [], [])
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.data.collections["leafVert"].objects.link(obj)
    deselect()
    leafNumber += 1
```

## Script 3: Leaf Object Adder

Instances a named template object ("Kyte") at each vertex position in the `leafVert` collection. Scale and rotation are driven by the point's spherical coordinates and radial distance, producing the generative tilt and twist variation described in the Leaves section.

```python
import bpy, bmesh
import numpy as np
import math

def asSpherical(xyz):
    x = xyz[0]; y = xyz[1]; z = xyz[2]
    r     = np.sqrt(x*x + y*y + z*z)
    theta = np.arccos(z / r) * 180 / np.pi
    phi   = np.arctan2(y, x) * 180 / np.pi
    return [r, theta, phi]

def makeLeaf(location, template, name):
    sCo = asSpherical(location)
    newLeaf = bpy.data.objects.new(name, bpy.data.objects[template].data)
    newLeaf.location = location

    distance  = (location[0]**2 + location[1]**2)**0.5
    scalefac  = ((1 + distance) / 5)**1.5

    newLeaf.scale = (scalefac**0.9, scalefac, scalefac)

    rotation  = (sCo[2] * math.pi / 180) + np.pi / 2
    rotation2 = (distance * np.pi) / 32

    newLeaf.rotation_euler = ((math.pi / 2) + rotation2, 0, rotation)
    bpy.data.collections["leaf "].objects.link(newLeaf)

leafNum = 1
for leaf in bpy.data.collections["leafVert"].objects:
    origin = len(leaf.data.vertices) - 1
    oX = leaf.data.vertices[origin].co[0]
    oY = leaf.data.vertices[origin].co[1]
    oZ = leaf.data.vertices[origin].co[2]
    name = "leaf {}".format(leafNum)
    makeLeaf([oX, oY, oZ], "Kyte", name)
    leafNum += 1
```

## Parameter Reference

| Parameter | Default | Effect |
|-----------|---------|--------|
| `radius` | 3 m | Dome base radius |
| `height` | 3 m | Dome apex height |
| `pointNumber` | 610 | Total phyllotactic points (higher = denser) |
| `vertNum` / `horizNum` | 21 / 34 | Lattice denominators; use adjacent Fibonacci pairs |
| `jointDiam` | 0.015 m | Joint arm and sphere diameter |
| `poleRad` | 0.01 m | Lattice strut radius |
| `leafGen` | 0 | `1`: generate flat leaf meshes; `0`: vertex positions only (for Script 3) |
| `topLineOrFlat` | True | `True`: flat cap polygon; `False`: converging struts to apex |
