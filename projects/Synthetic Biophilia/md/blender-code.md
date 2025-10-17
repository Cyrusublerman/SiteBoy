> Orientation: paste into Blender **Text Editor** and run. Scripts create Collections: `points`, `lattice`, `joints`, `topLine`, `leaf `, `leafVert`, `bottom`. Units assume metres. Material names referenced in code (e.g. “Brass”, “Smudged Glass”, “pole1”) should exist in the file.

---

## Python Script: Main Generator (verbatim)

```python
import bpy, bmesh
import numpy as np
import math
import os
import pprint
#===========================================
################## INPUT ###################
# standard measurement is meters 
radius = 3
height = 3
pointNumber = 610
jointDiam = 0.015
jointLength = jointDiam*4
poleRad=0.01
vertNum = 21
horizNum =34
leafGen=0
topPoint = [0.0, 0.0,
```

```python
import bpy, bmesh
import numpy as np
import math
import os
import pprint

rad=0.2
def deselect():
    for obj in bpy.data.objects:
        obj.select_set(False)
pp=pprint.pprint
def asCartesian(rthetaphi):
    #takes list rthetaphi (single coord)
    r       = rthetaphi[0]
    theta   = rthetaphi[1]* np.pi/180 # to radian
    phi     = rthetaphi[2]* np.pi/180

    x = r * np.sin( theta ) * np.cos( phi )
    y = r * np.sin( theta ) * np.sin( phi )
    z = r * np.cos( theta )
    return [x,y,z]
def asSpherical(xyz):
    #takes list xyz (single coord)
    x       = xyz[0]
    y       = xyz[1]
    z       = xyz[2]
    r       =  np.sqrt(x*x + y*y + z*z)
    theta   =  np.arccos(z/r)*180/ np.pi #to degrees
    phi     =  np.arctan2(y,x)*180/ np.pi
    return [r,theta,phi]
#======== function to change material========
def setMat(matName):
    mat = bpy.data.materials.get(matName)
    for o in bpy.context.selected_objects:
      if o.data.materials:
        o.data.materials[0] = mat
      else:
        o.data.materials.append(mat)
#============= make frame ============#
def makeLine(start, end, radiusX, radiusY, name, collection):

    startLocation = start
    endLocation = end
```

### Top closure (“top con” and flat cap)

```python
#========= top con ==============#
vP=0
# take third element for sort (phi angle)
def takeX(elem):
    return elem[2]
      
topPieces.sort(key=takeX)
top2=[]
t=0
while t<(len(topPieces)-1):
    
    start=asCartesian(topPieces[t])
    top2.append(start)
    
    end=asCartesian(topPieces[t+1])
    name = "poleTop {}".format(vP)
    
    radiusX=poleRad
    radiusy=poleRad
    
    if not topLineOrFlat:
        makeLine(start, [0, 0, height] , radiusX, radiusY, name, 
"topLine", "Stainless Steel")
   
    t+=1
    
    vP+=1
    
    
top2.append(end)
if top2 and topLineOrFlat:      
    
    edges = [[i, i+1] for i in range(len(top2)-1)]
    lastEdge=[edges[-1][1], edges[0][0]]
    edges.append(lastEdge)
    
    vert=top2
    vert.append([0,0,height])
    
    faces =[[i, i+1, (len(top2)-1)] for i in range(len(top2))]
    faces.append([(len(vert)-1), (len(vert)-2), 0])
    
    mesh = bpy.data.meshes.new("topmesh")
    mesh.from_pydata(vert, edges, faces)
    mesh.update()
    
    obj = bpy.data.objects.new("topob", mesh)
    bpy.context.collection.objects.link(obj)
    
    deselect()
    
    bpy.context.view_layer.objects.active = bpy.data.objects["topob"]
    
    setMat("pole1")
    
    o=bpy.context.active_object   
    o.modifiers.new('Solidify', 'SOLIDIFY')
    bpy.context.object.modifiers["Solidify"].offset = 0.7
    bpy.context.object.modifiers["Solidify"].thickness = 0.05
```

### Hole-leaf infill at the apex

```python
#===========  make hole leaves  ==============# 
leafNumber=0   
vertMod=0.1
for leaf in holeLeaves:
    
    if len(leaf)>3:
        if distanceFromCenter(leaf[3])<distanceFromCenter(-
leaf[0]):
            leaf.pop(0)
            leaf.pop(0)
            leaf.append(topPoint)
 
    vert=leaf
    
    if leafGen>0:
        
        edges = [[i, i+1] for i in range(len(leaf)-1)]
        lastEdge=[0,len(edges)-1]
        
        edges.append(lastEdge) 
        
        faces =[[i for i in range(len(leaf))]]
        
        name = "leaf {}".format(leafNumber)
        
        mesh = bpy.data.meshes.new(name)
        
        mesh.from_pydata(vert, edges, faces)
        mesh.update()
        
        obj = bpy.data.objects.new(name, mesh)
        bpy.data.collections["leaf "].objects.link(obj)
        
    else:
        vert.sort(key=takeX) #sort by z
        edges = []
        
        faces =[]
        
        name = "leaf Vert {}".format(leafNumber)
        
        mesh = bpy.data.meshes.new(name)
        
        mesh.from_pydata(vert, edges, faces)
        mesh.update()
        
        obj = bpy.data.objects.new(name, mesh)
        bpy.data.collections["leafVert"].objects.link(obj)
        
    deselect()
    
    leafNumber+=1
```

### Joints and bottom poles

```python
#+++++++++++++ make joints ++++++++++++++[
jointNum=1

for j in joints2Angles:
    origin = j[0]
    ji=1
    deselect()
    toJoin=[]
    while ji<len(j):  
        r=0.1
        radiusX = jointDiam
        radiusY=radiusX
        start = origin
        end=j[ji]
        end= asCartesian(end)
        end[0]+=start[0]
        end[1]+=start[1]
        end[2]+=start[2]
        name = "join {}".format(jointNum)
        name2 = "join {} {}".format(jointNum, ji)
        toJoin.append(name2)
        makeLine(start, end, radiusX, radiusY, name2, "joints", "Brass")
        ji+=1        
    joinName="join {} c".format(jointNum) 
    sphereAtJoint(origin, joinName, "joints", "Brass", 1.2)
    deselect()
    #sphereAtJoint(origin, joinName, "points", "Brass", 2)
    toJoin.append(joinName)

# ============== BOTTOM BITS =============
bj=0
for b in bottomJoints:
    start = b[0]
    end = [start[0], start[1], 0]
    name="bottom pole {}".format(bj)
    makeLine(start, end, poleRad, poleRad, name, "bottom", "Stainless Steel")
    bj+=1
```

---

## Python Script: Negative Space / Leaf Generator (verbatim excerpt)

```python
# ... earlier functions ...
frameName ="frame {}".format(name)
makeLine(start, end, radiusX, radiusY,frameName, "leaf ")

mesh = bpy.data.meshes.new(name)
mesh.from_pydata(verts, edges, faces)
mesh.update()

o = bpy.data.objects.new(name, mesh)
bpy.data.collections["leaf "].objects.link(o)

mod = o.modifiers.new("Solidify", 'SOLIDIFY')
mod.offset = 0
mod.thickness = 0.0002

deselect()

leafNumber+=1

#bpy.data.collections["leafVert"].objects.unlink(leaf)

for obj in bpy.data.collections["leaf "].objects:
    if "frame" in obj.name:
        obj.select_set(True)
        print(obj.name)
        bpy.context.view_layer.objects.active =o
        setMat("Brass")
        deselect()
    else:
        obj.select_set(True)
        print(obj.name)
        bpy.context.view_layer.objects.active =o
        setMat("Smudged Glass")
        deselect()
```

---

## Python Script: Leaf Object Adder (verbatim)

```python
import bpy, bmesh
import numpy as np
import math

def asSpherical(xyz):
    #takes list xyz (single coord)
    x       = xyz[0]
    y       = xyz[1]    
    z       = xyz[2]
    r       =  np.sqrt(x*x + y*y + z*z)
    theta   =  np.arccos(z/r)*180/ np.pi #to degrees
    phi     =  np.arctan2(y,x)*180/ np.pi
    return [r,theta,phi]
      

def makeLeaf(location, object, name):
    sCo=asSpherical(location)
    newLeaf= bpy.data.objects.new(name, bpy.data.objects[object].data)
    newLeaf.location=location
    
    distance = (location[0]**2+location[1]**2)**0.5
    scalefac=(((1+distance)/5)**1.5)
    
    newLeaf.scale=(scalefac**0.9, scalefac, scalefac)
    
    rotation = (sCo[2]*(math.pi)/180)+np.pi/2
    rotation2=(distance*np.pi)/32
    
    newLeaf.rotation_euler=((math.pi/2)+rotation2,0,rotation)
    
    bpy.data.collections["leaf "].objects.link(newLeaf)
       
leafNum=1

for leaf in bpy.data.collections["leafVert"].objects:
    origin=len(leaf.data.vertices)-1
    verts=[]
    oX=leaf.data.vertices[origin].co[0]
    oY=leaf.data.vertices[origin].co[1]
    oZ=leaf.data.vertices[origin].co[2] 
    name="leaf {}".format(leafNum)
    
    makeLeaf([oX, oY, oZ], "Kyte", name)
    leafNum+=1
```

---

## Notes (usage)

* **Run order:** main generator → negative space/leaf generator → leaf object adder (optional “Kyte” shape).
* **Top cap:** choose `topLineOrFlat` to switch between converging struts and flat cap. `holeLeaves` block fills with trapezoid-like leaves to the `topPoint`.
* **Collections:** code expects collections named `leaf ` (note trailing space) and `leafVert`.
* **Materials:** `pole1`, `Brass`, `Smudged Glass`, `Stainless Steel` should exist.
