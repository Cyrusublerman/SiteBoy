import bpy

obj = bpy.context.active_object

if not obj or bpy.context.mode != 'OBJECT':
    raise RuntimeError("Select one object and switch to Object Mode")

# Duplicate
bpy.ops.object.duplicate(linked=False)
new_obj = bpy.context.active_object

# Hide Solidify
for mod in new_obj.modifiers:
    if mod.type == 'SOLIDIFY':
        mod.show_viewport = False

# Apply other modifiers
bpy.ops.object.convert(target='MESH')

# Apply transforms
bpy.ops.object.transform_apply(
    location=True,
    rotation=True,
    scale=True
)

# Export with NozzleBoss
bpy.ops.wm.gcode_export()

# Delete the copy 
bpy.ops.object.select_all(action='DESELECT')
new_obj.select_set(True)
bpy.context.view_layer.objects.active = new_obj
bpy.ops.object.delete(use_global=False)
