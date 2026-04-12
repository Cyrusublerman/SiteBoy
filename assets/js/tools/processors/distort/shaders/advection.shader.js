/**
 * DISTORT — Advection Node GPU Shaders
 *
 * GPU pattern: gather (multi-step velocity field sampling)
 * Repeatedly displaces sample coordinates along a velocity field (noise, radial, or vortex).
 * GPU implements noise and radial velocity types; vortex is equivalent to spinning radial.
 *
 * See: nodes/warp/AdvectionNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uVelocityType, uSteps, uSpeed, uNoiseScale, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

const VEL_INDEX = { 'noise': 0, 'radial': 1, 'vortex': 2 };

export const gpuBindings = {
  uniforms: { uVelocityType: 'i32', uSteps: 'f32', uSpeed: 'f32', uNoiseScale: 'f32' },
  multiPass: false,
  uniformMap: p => ({
    uVelocityType: VEL_INDEX[p.velocityType] ?? 0,
    uSteps: p.steps, uSpeed: p.speed, uNoiseScale: p.noiseScale,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth        : f32,
  uHeight       : f32,
  uVelocityType : f32,
  uSteps        : f32,
  uSpeed        : f32,
  uNoiseScale   : f32,
  _pad          : f32,
  _pad2         : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn hash2(n: f32) -> f32 { return fract(sin(n) * 43758.5453123); }
fn fade(t: f32) -> f32  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx=i32(h*7.)%8;
  let gx=array<f32,8>(1.,-1.,1.,-1.,0.,0.,1.,-1.);
  let gy=array<f32,8>(1.,1.,-1.,1.,1.,-1.,0.,0.);
  return gx[idx]*x+gy[idx]*y;
}

fn perlin(px: f32, py: f32) -> f32 {
  let ix=floor(px);let iy=floor(py);let fx=px-ix;let fy=py-iy;
  let ux=fade(fx);let uy=fade(fy);
  return mix(mix(grad2(hash2(ix+iy*57.),fx,fy),grad2(hash2(ix+1.+iy*57.),fx-1.,fy),ux),
             mix(grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.),grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.),ux),uy);
}

fn velocity(px: f32, py: f32, vtype: i32, sc: f32) -> vec2f {
  if (vtype == 0) {
    return vec2f(perlin(px*sc, py*sc), perlin(px*sc+5.2, py*sc+1.3));
  } else if (vtype == 1) {
    // radial from centre
    let dx=px-0.5; let dy=py-0.5;
    let len=sqrt(dx*dx+dy*dy);
    return select(vec2f(0.0), vec2f(dx,dy)/len, len > 0.001);
  } else {
    // vortex (perpendicular to radial)
    let dx=px-0.5; let dy=py-0.5;
    let len=sqrt(dx*dx+dy*dy);
    return select(vec2f(0.0), vec2f(-dy,dx)/len, len > 0.001);
  }
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1);let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x);let fy=y-floor(y);
  return mix(mix(textureLoad(tIn,vec2i(x0,y0),0),textureLoad(tIn,vec2i(x1,y0),0),fx),
             mix(textureLoad(tIn,vec2i(x0,y1),0),textureLoad(tIn,vec2i(x1,y1),0),fx),fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x=i32(id.x);let y=i32(id.y);
  let w=i32(uni.uWidth);let h=i32(uni.uHeight);
  if(x>=w||y>=h){return;}

  let vtype=i32(uni.uVelocityType);
  let steps=clamp(i32(uni.uSteps),1,30);
  let speed=uni.uSpeed;
  let sc=uni.uNoiseScale;

  var wx=f32(x);var wy=f32(y);
  for(var s=0;s<steps;s++){
    let v=velocity(wx/uni.uWidth, wy/uni.uHeight, vtype, sc);
    wx+=v.x*speed;
    wy+=v.y*speed;
  }
  textureStore(tOut, vec2i(x,y), bilinear(wx,wy,w,h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uVelocityType;
uniform float uSteps; uniform float uSpeed; uniform float uNoiseScale;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n){return fract(sin(n)*43758.5453123);}
float fade(float t){return t*t*t*(t*(t*6.-15.)+10.);}

float grad2(float h,float x,float y){
  int idx=int(h*7.)%8;
  float gx[8];float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx]*x+gy[idx]*y;
}

float perlinN(float px,float py){
  float ix=floor(px);float iy=floor(py);float fx=px-ix;float fy=py-iy;
  float ux=fade(fx);float uy=fade(fy);
  return mix(mix(grad2(hash2(ix+iy*57.),fx,fy),grad2(hash2(ix+1.+iy*57.),fx-1.,fy),ux),
             mix(grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.),grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.),ux),uy);
}

vec2 vel(float px,float py,float sc){
  if(uVelocityType==0) return vec2(perlinN(px*sc,py*sc),perlinN(px*sc+5.2,py*sc+1.3));
  vec2 d=vec2(px-.5,py-.5);float l=length(d);
  if(l<0.001) return vec2(0.);
  if(uVelocityType==1) return d/l;
  return vec2(-d.y,d.x)/l;
}

void main(){
  vec2 res=vec2(textureSize(uTex,0));
  int steps=clamp(int(uSteps),1,30);
  float wx=vUV.x;float wy=vUV.y;
  for(int s=0;s<30;s++){
    if(s>=steps)break;
    vec2 v=vel(wx,wy,uNoiseScale);
    wx+=v.x*uSpeed/res.x;wy+=v.y*uSpeed/res.y;
  }
  fragColor=texture(uTex,clamp(vec2(wx,wy),vec2(0.),vec2(1.)));
}
`;
