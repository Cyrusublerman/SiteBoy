/**
 * Dithering algorithms (logic only)
 * All functions operate on ImageData and palettes and return new ImageData.
 * Consumers provide a colorSpace with rgbToLab/hexToRgb (injected from app).
 */

// Helpers
const deltaE76 = (a, b) => {
    const dL = a.L - b.L, da = a.a - b.a, db = a.b - b.b;
    return Math.sqrt(dL*dL + da*da + db*db);
};
const clamp = (v, min=0, max=255) => Math.max(min, Math.min(max, v));
const vecSub = (A,B) => ({ L:A.L-B.L, a:A.a-B.a, b:A.b-B.b });
const vecDot = (A,B) => A.L*B.L + A.a*B.a + A.b*B.b;
const vecMagSq = (A) => vecDot(A,A);

const pickNearest = (lab, paletteLabs) => {
    let best=0, bestD=Infinity;
    for (let i=0;i<paletteLabs.length;i++){
        const d = deltaE76(lab, paletteLabs[i]);
        if (d < bestD) { bestD = d; best = i; if (d < 0.001) break; }
    }
    return best;
};

const projectOntoSegment = (O, P1, P2) => {
    const V = vecSub(P2,P1);
    const W = vecSub(O,P1);
    const VV = vecMagSq(V);
    if (VV < 1e-9) return { pointM:P1, weightP1:1.0 };
    const t = vecDot(W,V)/VV;
    const tc = Math.max(0, Math.min(1, t));
    return { pointM:{ L:P1.L+V.L*tc, a:P1.a+V.a*tc, b:P1.b+V.b*tc }, weightP1: 1.0 - tc };
};

const findOppositeColor = (O, idxC, paletteLabs) => {
    if (paletteLabs.length < 2) return -1;
    const C = paletteLabs[idxC];
    const OC = vecSub(C,O);
    const magOC = Math.sqrt(vecMagSq(OC));
    if (magOC < 1e-9) return -1;
    let best=-1, minCos=1.0;
    for (let k=0;k<paletteLabs.length;k++){
        if (k===idxC) continue;
        const OK = vecSub(paletteLabs[k], O);
        const magOK = Math.sqrt(vecMagSq(OK));
        const denom = magOC*magOK; if (denom < 1e-9) continue;
        const cos = vecDot(OC,OK)/denom;
        if (cos < minCos){ minCos = cos; best = k; }
    }
    return best;
};

export function ditherNone(imageData, palette, paletteLabs, colorSpace){
    const { width, height, data } = imageData; const out = new Uint8ClampedArray(data.length);
    for (let i=0;i<data.length;i+=4){
        const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3];
        const lab = colorSpace.rgbToLab(r,g,b);
        const idx = pickNearest(lab, paletteLabs);
        const q = colorSpace.hexToRgb(palette[idx] || '#000000');
        out[i]=q.r; out[i+1]=q.g; out[i+2]=q.b; out[i+3]=a;
    }
    return new ImageData(out, width, height);
}

export function ditherBlueNoiseNearestOppositeChecked(imageData, palette, paletteLabs, colorSpace, blueNoise){
    const { width, height, data } = imageData; const out = new Uint8ClampedArray(data.length);
    const bnW=blueNoise.width, bnH=blueNoise.height, bnD=blueNoise.data;
    for (let y=0;y<height;y++){
        for (let x=0;x<width;x++){
            const i4=(y*width+x)*4; const r=data[i4], g=data[i4+1], b=data[i4+2], a=data[i4+3];
            const O = colorSpace.rgbToLab(r,g,b);
            const idxC = pickNearest(O, paletteLabs);
            const labC = paletteLabs[idxC];
            const distC = deltaE76(O, labC);
            let chosen = idxC;
            if (distC >= 0.001){
                const idxI = findOppositeColor(O, idxC, paletteLabs);
                if (idxI !== -1){
                    const labI = paletteLabs[idxI];
                    const { pointM, weightP1 } = projectOntoSegment(O, labC, labI);
                    const distM = deltaE76(O, pointM);
                    if (distM < distC){
                        const bnX=x%bnW, bnY=y%bnH; const bnIdx=(bnY*bnW+bnX)*4; const bnV=bnD[bnIdx]/255;
                        chosen = (bnV < weightP1) ? idxC : idxI;
                    }
                }
            }
            const q = colorSpace.hexToRgb(palette[chosen] || '#000000');
            out[i4]=q.r; out[i4+1]=q.g; out[i4+2]=q.b; out[i4+3]=a;
        }
    }
    return new ImageData(out, width, height);
}

export function ditherFloydSteinberg(imageData, palette, paletteLabs, colorSpace){
    const { width, height, data } = imageData; const out = new Float32Array(data.length);
    for (let i=0;i<data.length;i++) out[i] = data[i];
    const setPx = (i, r,g,b,a)=>{ out[i]=r; out[i+1]=g; out[i+2]=b; out[i+3]=a; };
    const getPx = (i)=>({ r: out[i], g: out[i+1], b: out[i+2], a: out[i+3] });
    for (let y=0;y<height;y++){
        for (let x=0;x<width;x++){
            const i4=(y*width+x)*4; const p=getPx(i4);
            const lab=colorSpace.rgbToLab(p.r, p.g, p.b); const idx=pickNearest(lab, paletteLabs);
            const q=colorSpace.hexToRgb(palette[idx]||'#000000');
            const er=p.r-q.r, eg=p.g-q.g, eb=p.b-q.b;
            setPx(i4, q.r, q.g, q.b, p.a);
            // diffuse error
            const diffuse=(xx,yy,fr,fg,fb)=>{ if (xx<0||xx>=width||yy<0||yy>=height) return; const j=(yy*width+xx)*4; out[j]+=fr; out[j+1]+=fg; out[j+2]+=fb; };
            diffuse(x+1,y,   er*7/16, eg*7/16, eb*7/16);
            diffuse(x-1,y+1, er*3/16, eg*3/16, eb*3/16);
            diffuse(x,  y+1, er*5/16, eg*5/16, eb*5/16);
            diffuse(x+1,y+1, er*1/16, eg*1/16, eb*1/16);
        }
    }
    const out8 = new Uint8ClampedArray(data.length);
    for (let i=0;i<out8.length;i+=4){ out8[i]=clamp(out[i]); out8[i+1]=clamp(out[i+1]); out8[i+2]=clamp(out[i+2]); out8[i+3]=clamp(out[i+3]); }
    return new ImageData(out8, width, height);
}

export const DitherFunctions = {
    none: ditherNone,
    'blue-noise': ditherBlueNoiseNearestOppositeChecked,
    'floyd-steinberg': ditherFloydSteinberg
};

export default DitherFunctions;


