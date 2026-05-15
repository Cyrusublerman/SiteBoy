import{t as e}from"./animation-foundation-CjDnqZPq.js";import{t}from"./index-BTjryfra.js";import{t as n}from"./tool-base-CLBRW1lu.js";import{a as r}from"./algorithms-BxPqxMvi.js";var i=null,a=null,o=null,s={playing:!1,mode:`none`,startTime:0,phaseAnimations:{phi_r1:{enabled:!1,speed:1,direction:1},phi_r2:{enabled:!1,speed:1,direction:1},phi_x1:{enabled:!1,speed:1,direction:1},phi_x2:{enabled:!1,speed:1,direction:1},phi_y1:{enabled:!1,speed:1,direction:1},phi_y2:{enabled:!1,speed:1,direction:1}},phaseBaseValues:{}},c={"20 Rings (Default)":{Ar1:1,fr1:20,pr1:1},"1 Ring":{Ar1:1,fr1:1,pr1:1},"3 Rings":{Ar1:1,fr1:3,pr1:1},"5 Rings":{Ar1:1,fr1:5,pr1:1},"10 Rings":{Ar1:1,fr1:10,pr1:1},"Inverted 5 Rings":{Ar1:-1,fr1:5,pr1:1},"Offset Rings":{Ar1:1,fr1:5,pr1:1,Or1:.3},"Horizontal Lines":{Ay1:1,fy1:5,py1:1},"Vertical Lines":{Ax1:1,fx1:5,px1:1},"Grid 5×5":{Ax1:1,fx1:5,px1:1,Ay1:1,fy1:5,py1:1},"Moiré Cross":{Ax1:1,fx1:5,px1:1,Ay1:1,fy1:5.5,py1:1},"Rings + Grid":{Ar1:1,fr1:5,pr1:1,Ax1:.3,fx1:8,px1:1,Ay1:.3,fy1:8,py1:1},"Complex Interference":{Ar1:1,fr1:3,pr1:1,Ar2:.5,fr2:7,pr2:1,Ax1:.3,fx1:10,px1:1}};function l(){return{Ar1:1,fr1:20,pr1:1,phi_r1:0,Or1:0,wave_r1:`sin`,Ar2:0,fr2:0,pr2:1,phi_r2:0,Or2:0,wave_r2:`sin`,Mr:0,frm1:0,prm1:1,phi_rm1:0,frm2:0,prm2:1,phi_rm2:0,Ax1:0,fx1:0,px1:1,phi_x1:0,Ox1:0,wave_x1:`sin`,Ax2:0,fx2:0,px2:1,phi_x2:0,Ox2:0,wave_x2:`sin`,Mx:0,fxm1:0,pxm1:1,phi_xm1:0,fxm2:0,pxm2:1,phi_xm2:0,Ay1:0,fy1:0,py1:1,phi_y1:0,Oy1:0,wave_y1:`sin`,Ay2:0,fy2:0,py2:1,phi_y2:0,Oy2:0,wave_y2:`sin`,My:0,fym1:0,pym1:1,phi_ym1:0,fym2:0,pym2:1,phi_ym2:0,scale:300,rotation:0,blendMode:`sum`}}var u={amp:{min:-2,max:2,step:.1},freq:{min:0,max:50,step:.5},power:{min:-7,max:7,step:.1},phase:{min:-6.28,max:6.28,step:.01},offset:{min:-2,max:2,step:.1}};function d(e,t,n,r){return[`slider`,e,t.min,t.max,t.step,{value:r===void 0?0:r,key:n,withNumber:!0}]}var f={title:`WAVE INTERFERENCE`,sidebar:[[`EQUATION`,[[`R(r) Term 1`,[d(`Ar₁`,u.amp,`Ar1`,1),d(`fr₁`,u.freq,`fr1`,20),d(`pr₁`,u.power,`pr1`,1),d(`φr₁`,u.phase,`phi_r1`,0)]],[`R(r) Term 2`,[d(`Ar₂`,u.amp,`Ar2`,0),d(`fr₂`,u.freq,`fr2`,0),d(`pr₂`,u.power,`pr2`,1),d(`φr₂`,u.phase,`phi_r2`,0)]],[`X(x) Term 1`,[d(`Ax₁`,u.amp,`Ax1`,0),d(`fx₁`,u.freq,`fx1`,0),d(`px₁`,u.power,`px1`,1),d(`φx₁`,u.phase,`phi_x1`,0)]],[`X(x) Term 2`,[d(`Ax₂`,u.amp,`Ax2`,0),d(`fx₂`,u.freq,`fx2`,0),d(`px₂`,u.power,`px2`,1),d(`φx₂`,u.phase,`phi_x2`,0)]],[`Y(y) Term 1`,[d(`Ay₁`,u.amp,`Ay1`,0),d(`fy₁`,u.freq,`fy1`,0),d(`py₁`,u.power,`py1`,1),d(`φy₁`,u.phase,`phi_y1`,0)]],[`Y(y) Term 2`,[d(`Ay₂`,u.amp,`Ay2`,0),d(`fy₂`,u.freq,`fy2`,0),d(`py₂`,u.power,`py2`,1),d(`φy₂`,u.phase,`phi_y2`,0)]]]],[`CONTROLS`,[[`View`,[[`slider`,`Scale`,50,500,10,{value:300,key:`scale`,withNumber:!0}],[`slider`,`Rotation`,0,360,1,{value:0,key:`rotation`,withNumber:!0}],[`radio`,`Blend`,[`sum`,`multiply`],{key:`blendMode`,selectedValue:`sum`}]]],[`Presets`,[[`dropdown`,`Landmark`,Object.keys(c),{key:`landmark`,value:`20 Rings (Default)`}],[`button`,`Apply Preset`,null,{key:`applyPreset`}],[`button`,`Clear All`,null,{key:`clearAll`}]]],[`Vector Export`,[[`button`,`Export SVG`,null,{key:`exportSvg`}]]]]],[`ANIMATION`,[[`Checkpoints`,[[`button`,`Save State`,null,{key:`saveCheckpoint`}]]],[`Phase Animation`,[[`toggle`,`Phases`,[`φr₁`,`φr₂`,`φx₁`,`φy₁`],{key:`animPhases`,selectedValues:[]}],[`slider`,`Speed`,.1,5,.1,{value:1,key:`phaseSpeed`,withNumber:!0}]]],[`Playback`,[[`toggle`,`Loop`,[`Enabled`],{key:`sequenceLoop`,selectedValues:[`Enabled`]}],[`button`,`Play/Pause`,null,{key:`playPause`}],[`button`,`Stop`,null,{key:`stopAnim`}]]]]]],canvas:{width:840,height:840,displayMode:`fit`,showControls:!0},onInit:function(e){var t=this;v(t),E(t,`applyPreset`,function(){var e=c[t.getValues().landmark];if(e){var n={Ar1:0,Ar2:0,Mr:0,Ax1:0,Ax2:0,Mx:0,Ay1:0,Ay2:0,My:0};Object.keys(n).forEach(function(e){t.setValue(e,0)});var r=l();Object.keys(r).forEach(function(e){!n.hasOwnProperty(e)&&e!==`scale`&&e!==`rotation`&&e!==`blendMode`&&t.setValue(e,r[e])}),Object.keys(e).forEach(function(n){t.setValue(n,e[n])}),t.draw()}}),E(t,`clearAll`,function(){var e=l();e.Ar1=0,e.fr1=0,Object.keys(e).forEach(function(n){n!==`scale`&&n!==`rotation`&&n!==`blendMode`&&t.setValue(n,e[n])}),t.draw()}),setTimeout(function(){b(t)},0),E(t,`playPause`,function(e){s.playing?(S(),e.textContent=`PLAY`):(x(t),e.textContent=`PAUSE`)}),E(t,`stopAnim`,function(){C();var e=t.getComponent(`playPause`);e&&e.element&&(e.element.textContent=`PLAY`)}),E(t,`exportSvg`,function(){T(t)})},onUpdate:function(e,t,n){if(e===`animPhases`){var r=t||[];s.phaseAnimations.phi_r1.enabled=r.indexOf(`φr₁`)>=0,s.phaseAnimations.phi_r2.enabled=r.indexOf(`φr₂`)>=0,s.phaseAnimations.phi_x1.enabled=r.indexOf(`φx₁`)>=0,s.phaseAnimations.phi_y1.enabled=r.indexOf(`φy₁`)>=0}else if(e===`phaseSpeed`){var i=parseFloat(t)||1;s.phaseAnimations.phi_r1.speed=i,s.phaseAnimations.phi_r2.speed=i,s.phaseAnimations.phi_x1.speed=i,s.phaseAnimations.phi_y1.speed=i}},onDraw:function(e,t,n){a?y(a,n):h(e,t,n)}};function p(e,t){if(Math.abs(e)<1e-9&&t<0)return 0;if(Math.abs(t-1)<1e-9)return e;if(Math.abs(t)<1e-9)return 1;var n=(e>=0?1:-1)*Math.abs(e)**+t;return!isFinite(n)||isNaN(n)?0:n}function m(e,t){return e===`cos`?Math.cos(t):Math.sin(t)}function h(e,t,n){for(var r=t.width,i=t.height,a=n.scale||300,o=(n.rotation||0)*Math.PI/180,s=n.blendMode||`sum`,c=Math.cos(o),l=Math.sin(o),u=r/2,d=i/2,f=Math.PI*2,h=e.createImageData(r,i),g=h.data,_=0;_<i;_++)for(var v=0;v<r;v++){var y=(v-u)/a,b=(_-d)/a;if(o!==0){var x=y*c-b*l,S=y*l+b*c;y=x,b=S}var C=Math.sqrt(y*y+b*b),w=0;Math.abs(n.Ar1)>1e-9&&(w+=n.Ar1*p(m(n.wave_r1,n.fr1*f*C+(n.phi_r1||0)),n.pr1||1)+(n.Or1||0)),Math.abs(n.Ar2)>1e-9&&(w+=n.Ar2*p(m(n.wave_r2,n.fr2*f*C+(n.phi_r2||0)),n.pr2||1)+(n.Or2||0)),Math.abs(n.Mr)>1e-9&&(w+=n.Mr*p(Math.sin(n.frm1*f*C+(n.phi_rm1||0)),n.prm1||1)*p(Math.cos(n.frm2*f*C+(n.phi_rm2||0)),n.prm2||1));var T=0;Math.abs(n.Ax1)>1e-9&&(T+=n.Ax1*p(m(n.wave_x1,n.fx1*f*y+(n.phi_x1||0)),n.px1||1)+(n.Ox1||0)),Math.abs(n.Ax2)>1e-9&&(T+=n.Ax2*p(m(n.wave_x2,n.fx2*f*y+(n.phi_x2||0)),n.px2||1)+(n.Ox2||0)),Math.abs(n.Mx)>1e-9&&(T+=n.Mx*p(Math.sin(n.fxm1*f*y+(n.phi_xm1||0)),n.pxm1||1)*p(Math.cos(n.fxm2*f*y+(n.phi_xm2||0)),n.pxm2||1));var E=0;Math.abs(n.Ay1)>1e-9&&(E+=n.Ay1*p(m(n.wave_y1,n.fy1*f*b+(n.phi_y1||0)),n.py1||1)+(n.Oy1||0)),Math.abs(n.Ay2)>1e-9&&(E+=n.Ay2*p(m(n.wave_y2,n.fy2*f*b+(n.phi_y2||0)),n.py2||1)+(n.Oy2||0)),Math.abs(n.My)>1e-9&&(E+=n.My*p(Math.sin(n.fym1*f*b+(n.phi_ym1||0)),n.pym1||1)*p(Math.cos(n.fym2*f*b+(n.phi_ym2||0)),n.pym2||1));var D=(s===`multiply`?w*T*E:w+T+E)>0?255:0,O=(_*r+v)*4;g[O]=D,g[O+1]=D,g[O+2]=D,g[O+3]=255}e.putImageData(h,0,0)}var g=`
        attribute vec2 a_position;
        varying vec2 v_coord;
        void main() {
            v_coord = a_position;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `,_=`
        precision highp float;
        varying vec2 v_coord;
        uniform vec2 u_resolution;
        uniform float u_scale;
        uniform float u_rotation;
        uniform float u_blendMode;
        
        // R equation uniforms
        uniform float u_Ar1, u_fr1, u_pr1, u_phi_r1, u_Or1, u_wave_r1;
        uniform float u_Ar2, u_fr2, u_pr2, u_phi_r2, u_Or2, u_wave_r2;
        uniform float u_Mr, u_frm1, u_prm1, u_phi_rm1, u_frm2, u_prm2, u_phi_rm2;
        
        // X equation uniforms
        uniform float u_Ax1, u_fx1, u_px1, u_phi_x1, u_Ox1, u_wave_x1;
        uniform float u_Ax2, u_fx2, u_px2, u_phi_x2, u_Ox2, u_wave_x2;
        uniform float u_Mx, u_fxm1, u_pxm1, u_phi_xm1, u_fxm2, u_pxm2, u_phi_xm2;
        
        // Y equation uniforms
        uniform float u_Ay1, u_fy1, u_py1, u_phi_y1, u_Oy1, u_wave_y1;
        uniform float u_Ay2, u_fy2, u_py2, u_phi_y2, u_Oy2, u_wave_y2;
        uniform float u_My, u_fym1, u_pym1, u_phi_ym1, u_fym2, u_pym2, u_phi_ym2;
        
        const float TWO_PI = 6.28318530718;
        
        float safePow(float base, float exp) {
            if (abs(base) < 1e-9 && exp < 0.0) return 0.0;
            if (abs(exp - 1.0) < 1e-9) return base;
            if (abs(exp) < 1e-9) return 1.0;
            return sign(base) * pow(abs(base), exp);
        }
        
        float waveFunc(float usecos, float val) {
            return usecos > 0.5 ? cos(val) : sin(val);
        }
        
        float evaluateR(float r) {
            float result = 0.0;
            if (abs(u_Ar1) > 1e-9) {
                result += u_Ar1 * safePow(waveFunc(u_wave_r1, u_fr1 * TWO_PI * r + u_phi_r1), u_pr1) + u_Or1;
            }
            if (abs(u_Ar2) > 1e-9) {
                result += u_Ar2 * safePow(waveFunc(u_wave_r2, u_fr2 * TWO_PI * r + u_phi_r2), u_pr2) + u_Or2;
            }
            if (abs(u_Mr) > 1e-9) {
                result += u_Mr * safePow(sin(u_frm1 * TWO_PI * r + u_phi_rm1), u_prm1) * 
                                safePow(cos(u_frm2 * TWO_PI * r + u_phi_rm2), u_prm2);
            }
            return result;
        }
        
        float evaluateX(float x) {
            float result = 0.0;
            if (abs(u_Ax1) > 1e-9) {
                result += u_Ax1 * safePow(waveFunc(u_wave_x1, u_fx1 * TWO_PI * x + u_phi_x1), u_px1) + u_Ox1;
            }
            if (abs(u_Ax2) > 1e-9) {
                result += u_Ax2 * safePow(waveFunc(u_wave_x2, u_fx2 * TWO_PI * x + u_phi_x2), u_px2) + u_Ox2;
            }
            if (abs(u_Mx) > 1e-9) {
                result += u_Mx * safePow(sin(u_fxm1 * TWO_PI * x + u_phi_xm1), u_pxm1) * 
                                safePow(cos(u_fxm2 * TWO_PI * x + u_phi_xm2), u_pxm2);
            }
            return result;
        }
        
        float evaluateY(float y) {
            float result = 0.0;
            if (abs(u_Ay1) > 1e-9) {
                result += u_Ay1 * safePow(waveFunc(u_wave_y1, u_fy1 * TWO_PI * y + u_phi_y1), u_py1) + u_Oy1;
            }
            if (abs(u_Ay2) > 1e-9) {
                result += u_Ay2 * safePow(waveFunc(u_wave_y2, u_fy2 * TWO_PI * y + u_phi_y2), u_py2) + u_Oy2;
            }
            if (abs(u_My) > 1e-9) {
                result += u_My * safePow(sin(u_fym1 * TWO_PI * y + u_phi_ym1), u_pym1) * 
                                safePow(cos(u_fym2 * TWO_PI * y + u_phi_ym2), u_pym2);
            }
        return result;
    }

        void main() {
            vec2 coord = v_coord * u_resolution.x * 0.5 / u_scale;
            
            // Apply rotation
            float rad = u_rotation * 3.14159265 / 180.0;
            float cosR = cos(rad);
            float sinR = sin(rad);
            float x = coord.x * cosR - coord.y * sinR;
            float y = coord.x * sinR + coord.y * cosR;
            
            float r = length(vec2(x, y));
            float rVal = evaluateR(r);
            float xVal = evaluateX(x);
            float yVal = evaluateY(y);
            
            float value = (u_blendMode > 0.5) ? (rVal * xVal * yVal) : (rVal + xVal + yVal);
            float color = value > 0.0 ? 1.0 : 0.0;
            
            gl_FragColor = vec4(vec3(color), 1.0);
        }
    `;function v(e){var t=e.getCanvas();if(t)try{var n=t.getContext(`webgl`)||t.getContext(`experimental-webgl`);if(!n){console.log(`WebGL not available, using CPU renderer`);return}var r=n.createShader(n.VERTEX_SHADER);if(n.shaderSource(r,g),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS)){console.error(`Vertex shader error:`,n.getShaderInfoLog(r));return}var i=n.createShader(n.FRAGMENT_SHADER);if(n.shaderSource(i,_),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS)){console.error(`Fragment shader error:`,n.getShaderInfoLog(i));return}var o=n.createProgram();if(n.attachShader(o,r),n.attachShader(o,i),n.linkProgram(o),!n.getProgramParameter(o,n.LINK_STATUS)){console.error(`Program link error:`,n.getProgramInfoLog(o));return}var s=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,s),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),n.STATIC_DRAW);var c=n.getAttribLocation(o,`a_position`);n.enableVertexAttribArray(c),n.vertexAttribPointer(c,2,n.FLOAT,!1,0,0),n.viewport(0,0,t.width,t.height),n.useProgram(o),a={gl:n,program:o,canvas:t},console.log(`✅ WebGL renderer initialized`)}catch(e){console.warn(`WebGL init failed:`,e)}}function y(e,t){var n=e.gl,r=e.program,i=e.canvas;n.viewport(0,0,i.width,i.height),n.uniform2f(n.getUniformLocation(r,`u_resolution`),i.width,i.height),n.uniform1f(n.getUniformLocation(r,`u_scale`),t.scale||300),n.uniform1f(n.getUniformLocation(r,`u_rotation`),t.rotation||0),n.uniform1f(n.getUniformLocation(r,`u_blendMode`),+(t.blendMode===`multiply`)),n.uniform1f(n.getUniformLocation(r,`u_Ar1`),t.Ar1||0),n.uniform1f(n.getUniformLocation(r,`u_fr1`),t.fr1||0),n.uniform1f(n.getUniformLocation(r,`u_pr1`),t.pr1||1),n.uniform1f(n.getUniformLocation(r,`u_phi_r1`),t.phi_r1||0),n.uniform1f(n.getUniformLocation(r,`u_Or1`),t.Or1||0),n.uniform1f(n.getUniformLocation(r,`u_wave_r1`),+(t.wave_r1===`cos`)),n.uniform1f(n.getUniformLocation(r,`u_Ar2`),t.Ar2||0),n.uniform1f(n.getUniformLocation(r,`u_fr2`),t.fr2||0),n.uniform1f(n.getUniformLocation(r,`u_pr2`),t.pr2||1),n.uniform1f(n.getUniformLocation(r,`u_phi_r2`),t.phi_r2||0),n.uniform1f(n.getUniformLocation(r,`u_Or2`),t.Or2||0),n.uniform1f(n.getUniformLocation(r,`u_wave_r2`),+(t.wave_r2===`cos`)),n.uniform1f(n.getUniformLocation(r,`u_Mr`),t.Mr||0),n.uniform1f(n.getUniformLocation(r,`u_frm1`),t.frm1||0),n.uniform1f(n.getUniformLocation(r,`u_prm1`),t.prm1||1),n.uniform1f(n.getUniformLocation(r,`u_phi_rm1`),t.phi_rm1||0),n.uniform1f(n.getUniformLocation(r,`u_frm2`),t.frm2||0),n.uniform1f(n.getUniformLocation(r,`u_prm2`),t.prm2||1),n.uniform1f(n.getUniformLocation(r,`u_phi_rm2`),t.phi_rm2||0),n.uniform1f(n.getUniformLocation(r,`u_Ax1`),t.Ax1||0),n.uniform1f(n.getUniformLocation(r,`u_fx1`),t.fx1||0),n.uniform1f(n.getUniformLocation(r,`u_px1`),t.px1||1),n.uniform1f(n.getUniformLocation(r,`u_phi_x1`),t.phi_x1||0),n.uniform1f(n.getUniformLocation(r,`u_Ox1`),t.Ox1||0),n.uniform1f(n.getUniformLocation(r,`u_wave_x1`),+(t.wave_x1===`cos`)),n.uniform1f(n.getUniformLocation(r,`u_Ax2`),t.Ax2||0),n.uniform1f(n.getUniformLocation(r,`u_fx2`),t.fx2||0),n.uniform1f(n.getUniformLocation(r,`u_px2`),t.px2||1),n.uniform1f(n.getUniformLocation(r,`u_phi_x2`),t.phi_x2||0),n.uniform1f(n.getUniformLocation(r,`u_Ox2`),t.Ox2||0),n.uniform1f(n.getUniformLocation(r,`u_wave_x2`),+(t.wave_x2===`cos`)),n.uniform1f(n.getUniformLocation(r,`u_Mx`),t.Mx||0),n.uniform1f(n.getUniformLocation(r,`u_fxm1`),t.fxm1||0),n.uniform1f(n.getUniformLocation(r,`u_pxm1`),t.pxm1||1),n.uniform1f(n.getUniformLocation(r,`u_phi_xm1`),t.phi_xm1||0),n.uniform1f(n.getUniformLocation(r,`u_fxm2`),t.fxm2||0),n.uniform1f(n.getUniformLocation(r,`u_pxm2`),t.pxm2||1),n.uniform1f(n.getUniformLocation(r,`u_phi_xm2`),t.phi_xm2||0),n.uniform1f(n.getUniformLocation(r,`u_Ay1`),t.Ay1||0),n.uniform1f(n.getUniformLocation(r,`u_fy1`),t.fy1||0),n.uniform1f(n.getUniformLocation(r,`u_py1`),t.py1||1),n.uniform1f(n.getUniformLocation(r,`u_phi_y1`),t.phi_y1||0),n.uniform1f(n.getUniformLocation(r,`u_Oy1`),t.Oy1||0),n.uniform1f(n.getUniformLocation(r,`u_wave_y1`),+(t.wave_y1===`cos`)),n.uniform1f(n.getUniformLocation(r,`u_Ay2`),t.Ay2||0),n.uniform1f(n.getUniformLocation(r,`u_fy2`),t.fy2||0),n.uniform1f(n.getUniformLocation(r,`u_py2`),t.py2||1),n.uniform1f(n.getUniformLocation(r,`u_phi_y2`),t.phi_y2||0),n.uniform1f(n.getUniformLocation(r,`u_Oy2`),t.Oy2||0),n.uniform1f(n.getUniformLocation(r,`u_wave_y2`),+(t.wave_y2===`cos`)),n.uniform1f(n.getUniformLocation(r,`u_My`),t.My||0),n.uniform1f(n.getUniformLocation(r,`u_fym1`),t.fym1||0),n.uniform1f(n.getUniformLocation(r,`u_pym1`),t.pym1||1),n.uniform1f(n.getUniformLocation(r,`u_phi_ym1`),t.phi_ym1||0),n.uniform1f(n.getUniformLocation(r,`u_fym2`),t.fym2||0),n.uniform1f(n.getUniformLocation(r,`u_pym2`),t.pym2||1),n.uniform1f(n.getUniformLocation(r,`u_phi_ym2`),t.phi_ym2||0),n.clear(n.COLOR_BUFFER_BIT),n.drawArrays(n.TRIANGLES,0,6)}function b(e){var t=e.getComponent(`saveCheckpoint`);if(!t||!t.element){setTimeout(function(){b(e)},100);return}for(var n=t.element.parentElement;n&&!n.classList.contains(`tool-block-content`);)n=n.parentElement;if(n||(n=t.element.parentElement),n.innerHTML=``,!window.ComponentLibrary||!window.ComponentLibrary.SequencerV2){console.error(`❌ ComponentLibrary.SequencerV2 not available`);return}var r=Object.keys(l());o=new window.ComponentLibrary.SequencerV2({fps:60,loop:!0,defaultHold:2,defaultSegmentDuration:1.5,defaultEasing:`easeInOutCubic`,onSave:function(){var t=e.getValues(),n={};return r.forEach(function(e){n[e]=t[e]}),n},onLoad:function(t){Object.keys(t).forEach(function(n){e.setValue(n,t[n])}),e.draw()},onFrame:function(t){Object.keys(t).forEach(function(n){e.setValue(n,t[n])}),e.draw()}},{}),n.appendChild(o.render());var i=o.getStripElement();i&&e.canvasArea&&e.canvasArea.appendChild(i),console.log(`✅ WaveInterference SequencerV2 created`)}function x(t){if(!s.playing){if(!Object.values(s.phaseAnimations).some(function(e){return e.enabled})){console.log(`Enable phase animation to use the phase animator`);return}s.playing=!0,s.startTime=performance.now();var n=t.getValues();Object.keys(s.phaseAnimations).forEach(function(e){s.phaseBaseValues[e]=n[e]||0}),e&&(i=new e({fps:60,onFrame:function(){w(t)}}),i.start())}}function S(){i&&(i.isPaused?i.resume():i.pause())}function C(){s.playing=!1,i&&(i.destroy(),i=null)}function w(e){if(s.playing){var t=(performance.now()-s.startTime)/1e3,n=e.getValues().phaseSpeed||1;Object.keys(s.phaseAnimations).forEach(function(r){var i=s.phaseAnimations[r];if(i.enabled){var a=(s.phaseBaseValues[r]+t*n*i.direction*Math.PI*2+Math.PI*2)%(Math.PI*4)-Math.PI*2;e.setValue(r,a)}}),e.draw()}}function T(e){let t=e.getCanvas();if(!t)return;let n=e.getValues(),i=t.width,a=t.height,o=n.scale||300,s=Math.PI*2,c=[];for(let e=0;e<a;e+=2)for(let t=0;t<i;t+=2){let r=(t-i/2)/o,l=(e-a/2)/o,u=Math.sqrt(r*r+l*l),d=n.Ar1?n.Ar1*p(Math.sin(n.fr1*s*u),n.pr1||1):0,f=n.Ax1?n.Ax1*p(Math.sin(n.fx1*s*r),n.px1||1):0,m=n.Ay1?n.Ay1*p(Math.sin(n.fy1*s*l),n.py1||1):0;d+f+m<=0&&c.push(`M${t},${e} h2 v2 h-2Z`)}let l=[];l.push(r.buildSVGHeader(i,a,`white`)),l.push(`<path d="${c.join(` `)}" fill="black"/>`),l.push(r.buildSVGFooter()),r.exportSVG(l.join(`
`),`wave-interference`)}function E(e,t,n){var r=e.getComponent(t);r&&r.element&&r.element.addEventListener(`click`,function(){n(r.element)})}var D=class{constructor(e,n={}){this.container=e,this.deps={ComponentLibrary:t,...n}}render(){try{this.tool=new n(f,this.deps),this.tool.mount(this.container),this.tool.draw(),console.log(`✅ WaveInterferenceTool rendered (v2.0 full features)`)}catch(e){console.error(`❌ WaveInterferenceTool error:`,e),this.container.innerHTML=`<div style="padding:20px;color:var(--c-text);"><h2>WAVE INTERFERENCE ERROR</h2><p style="color:red;">`+e.message+`</p></div>`}}destroy(){C(),o&&(o.destroy(),o=null),a=null,this.tool&&(this.tool.destroy(),this.tool=null)}};export{f as TOOL_CONFIG,D as WaveInterferenceTool,D as default};