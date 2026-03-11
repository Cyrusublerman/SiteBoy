document.addEventListener("DOMContentLoaded", () => {
  const CONFIG = {
    canvas: {
      size: 800,
      scale: 300,
      rotation: 0,
      backgroundColor: "#000000",
      strokeColor: "#ffffff",
      blendMode: "sum"
    },
    useGPU: true,
    editor: {
      ampRange: { min: -2, max: 2, step: 0.1 },
      freqRange: { min: 0, max: 50, step: 0.5 },
      powerRange: { min: -7, max: 7, step: 0.1 },
      phaseRange: { min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
      offsetRange: { min: -2, max: 2, step: 0.1 }
    }
  };

  const LANDMARKS = [
    { name: "20 Rings (Default)", Ar1: 1, fr1: 20, pr1: 1 },
    { name: "1 Ring", Ar1: 1, fr1: 1, pr1: 1 },
    { name: "3 Rings", Ar1: 1, fr1: 3, pr1: 1 },
    { name: "5 Rings", Ar1: 1, fr1: 5, pr1: 1 },
    { name: "10 Rings", Ar1: 1, fr1: 10, pr1: 1 },
    { name: "Inverted 5 Rings", Ar1: -1, fr1: 5, pr1: 1 },
    { name: "Offset Rings", Ar1: 1, fr1: 5, pr1: 1, Or1: 0.3 },
    { name: "Horizontal Lines", Ay1: 1, fy1: 5, py1: 1 },
    { name: "Vertical Lines", Ax1: 1, fx1: 5, px1: 1 },
    { name: "Grid 5×5", Ax1: 1, fx1: 5, px1: 1, Ay1: 1, fy1: 5, py1: 1 },
    { name: "Moiré Cross", Ax1: 1, fx1: 5, px1: 1, Ay1: 1, fy1: 5.5, py1: 1 },
    {
      name: "Rings + Grid",
      Ar1: 1,
      fr1: 5,
      pr1: 1,
      Ax1: 0.3,
      fx1: 8,
      px1: 1,
      Ay1: 0.3,
      fy1: 8,
      py1: 1
    },
    {
      name: "Complex Interference",
      Ar1: 1,
      fr1: 3,
      pr1: 1,
      Ar2: 0.5,
      fr2: 7,
      pr2: 1,
      Ax1: 0.3,
      fx1: 10,
      px1: 1
    }
  ];

  class SpatialEquation {
    constructor(params) {
      Object.assign(this, params);

      // Pre-compute which terms are active
      this.activeTerms = {
        r1: Math.abs(this.Ar1 || 0) > 1e-9,
        r2: Math.abs(this.Ar2 || 0) > 1e-9,
        rM: Math.abs(this.Mr || 0) > 1e-9,
        x1: Math.abs(this.Ax1 || 0) > 1e-9,
        x2: Math.abs(this.Ax2 || 0) > 1e-9,
        xM: Math.abs(this.Mx || 0) > 1e-9,
        y1: Math.abs(this.Ay1 || 0) > 1e-9,
        y2: Math.abs(this.Ay2 || 0) > 1e-9,
        yM: Math.abs(this.My || 0) > 1e-9
      };
    }

    evaluateR(r) {
      const TWO_PI = Math.PI * 2;
      let result = 0;

      if (this.activeTerms.r1) {
        const waveFunc = this.wave_r1 === "cos" ? Math.cos : Math.sin;
        const value =
          this.Ar1 *
          this.safePow(
            waveFunc(this.fr1 * TWO_PI * r + (this.phi_r1 || 0)),
            this.pr1
          );
        result += value + (this.Or1 || 0);
      }
      if (this.activeTerms.r2) {
        const waveFunc = this.wave_r2 === "cos" ? Math.cos : Math.sin;
        const value =
          this.Ar2 *
          this.safePow(
            waveFunc(this.fr2 * TWO_PI * r + (this.phi_r2 || 0)),
            this.pr2
          );
        result += value + (this.Or2 || 0);
      }
      if (this.activeTerms.rM) {
        result +=
          (this.Mr || 0) *
          this.safePow(
            Math.sin(this.frm1 * TWO_PI * r + (this.phi_rm1 || 0)),
            this.prm1
          ) *
          this.safePow(
            Math.cos(this.frm2 * TWO_PI * r + (this.phi_rm2 || 0)),
            this.prm2
          );
      }
      return result;
    }

    evaluateX(x) {
      const TWO_PI = Math.PI * 2;
      let result = 0;

      if (this.activeTerms.x1) {
        const waveFunc = this.wave_x1 === "cos" ? Math.cos : Math.sin;
        const value =
          this.Ax1 *
          this.safePow(
            waveFunc(this.fx1 * TWO_PI * x + (this.phi_x1 || 0)),
            this.px1
          );
        result += value + (this.Ox1 || 0);
      }
      if (this.activeTerms.x2) {
        const waveFunc = this.wave_x2 === "cos" ? Math.cos : Math.sin;
        const value =
          this.Ax2 *
          this.safePow(
            waveFunc(this.fx2 * TWO_PI * x + (this.phi_x2 || 0)),
            this.px2
          );
        result += value + (this.Ox2 || 0);
      }
      if (this.activeTerms.xM) {
        result +=
          (this.Mx || 0) *
          this.safePow(
            Math.sin(this.fxm1 * TWO_PI * x + (this.phi_xm1 || 0)),
            this.pxm1
          ) *
          this.safePow(
            Math.cos(this.fxm2 * TWO_PI * x + (this.phi_xm2 || 0)),
            this.pxm2
          );
      }
      return result;
    }

    evaluateY(y) {
      const TWO_PI = Math.PI * 2;
      let result = 0;

      if (this.activeTerms.y1) {
        const waveFunc = this.wave_y1 === "cos" ? Math.cos : Math.sin;
        const value =
          this.Ay1 *
          this.safePow(
            waveFunc(this.fy1 * TWO_PI * y + (this.phi_y1 || 0)),
            this.py1
          );
        result += value + (this.Oy1 || 0);
      }
      if (this.activeTerms.y2) {
        const waveFunc = this.wave_y2 === "cos" ? Math.cos : Math.sin;
        const value =
          this.Ay2 *
          this.safePow(
            waveFunc(this.fy2 * TWO_PI * y + (this.phi_y2 || 0)),
            this.py2
          );
        result += value + (this.Oy2 || 0);
      }
      if (this.activeTerms.yM) {
        result +=
          (this.My || 0) *
          this.safePow(
            Math.sin(this.fym1 * TWO_PI * y + (this.phi_ym1 || 0)),
            this.pym1
          ) *
          this.safePow(
            Math.sin(this.fym2 * TWO_PI * y + (this.phi_ym2 || 0)),
            this.pym2
          );
      }
      return result;
    }

    safePow(base, exp) {
      // Handle edge cases
      if (Math.abs(base) < 1e-9 && exp < 0) return 0; // Prevent infinity
      if (Math.abs(exp - 1) < 1e-9) return base; // Optimization for power=1
      if (Math.abs(exp) < 1e-9) return 1; // Anything^0 = 1

      // Use sign + abs to handle negative bases with fractional exponents
      const sign = Math.sign(base);
      const result = sign * Math.pow(Math.abs(base), exp);

      // Protect against NaN
      if (!isFinite(result) || isNaN(result)) return 0;

      return result;
    }
  }

  class Renderer {
    constructor(canvas, config) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.config = config;
      this.xCache = null;
      this.yCache = null;
      this.setupCanvas();
    }

    setupCanvas() {
      this.canvas.width = this.config.size;
      this.canvas.height = this.config.size;
    }

    draw(equation, isDraft = false) {
      const { size, scale, rotation = 0 } = this.config;
      const renderSize = isDraft ? Math.floor(size / 2) : size;
      const halfSize = size / 2;
      const scaleAdjust = size / renderSize;

      const imageData = this.ctx.createImageData(renderSize, renderSize);
      const data = imageData.data;

      const cosRot = Math.cos((rotation * Math.PI) / 180);
      const sinRot = Math.sin((rotation * Math.PI) / 180);

      for (let py = 0; py < renderSize; py++) {
        for (let px = 0; px < renderSize; px++) {
          // Calculate pixel position relative to center
          let x = (px * scaleAdjust - halfSize) / scale;
          let y = (py * scaleAdjust - halfSize) / scale;

          // Apply rotation around center
          if (rotation !== 0) {
            const xRot = x * cosRot - y * sinRot;
            const yRot = x * sinRot + y * cosRot;
            x = xRot;
            y = yRot;
          }

          const r = Math.sqrt(x * x + y * y);

          // Evaluate equations with rotated coordinates
          const rMod = equation.evaluateR(r);
          const xMod = equation.evaluateX(x);
          const yMod = equation.evaluateY(y);

          // Apply blend mode
          let value;
          if (CONFIG.canvas.blendMode === "multiply") {
            value = rMod * xMod * yMod;
          } else {
            value = rMod + xMod + yMod;
          }

          const color = value > 0 ? 255 : 0;

          const idx = (py * renderSize + px) * 4;
          data[idx] = color;
          data[idx + 1] = color;
          data[idx + 2] = color;
          data[idx + 3] = 255;
        }
      }

      // If draft mode, scale up
      if (isDraft) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = renderSize;
        tempCanvas.height = renderSize;
        tempCanvas.getContext("2d").putImageData(imageData, 0, 0);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(
          tempCanvas,
          0,
          0,
          renderSize,
          renderSize,
          0,
          0,
          size,
          size
        );
      } else {
        this.ctx.putImageData(imageData, 0, 0);
      }
    }
  }

  class WebGLRenderer {
    constructor(canvas, config) {
      this.canvas = canvas;
      this.gl = canvas.getContext("webgl");
      this.config = config;
      this.program = null;
      this.setupCanvas();
      this.setupWebGL();
    }

    setupCanvas() {
      this.canvas.width = this.config.size;
      this.canvas.height = this.config.size;
    }

    setupWebGL() {
      const gl = this.gl;
      if (!gl) return;

      const vsSource = `
                attribute vec2 a_position;
                varying vec2 v_coord;
                void main() {
                    v_coord = a_position;
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;

      const fsSource = `
                precision highp float;
                varying vec2 v_coord;
                uniform vec2 u_resolution;
                uniform float u_scale;
                uniform float u_rotation;
                uniform float u_blendMode; // 0=sum, 1=multiply
                
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
                    return sign(base) * pow(abs(base), exp);
                }
                
                float evaluateR(float r) {
                    float result = 0.0;
                    if (abs(u_Ar1) > 1e-9) {
                        float arg1 = u_fr1 * TWO_PI * r + u_phi_r1;
                        float wave1 = (u_wave_r1 > 0.5) ? cos(arg1) : sin(arg1);
                        result += u_Ar1 * safePow(wave1, u_pr1) + u_Or1;
                    }
                    if (abs(u_Ar2) > 1e-9) {
                        float arg2 = u_fr2 * TWO_PI * r + u_phi_r2;
                        float wave2 = (u_wave_r2 > 0.5) ? cos(arg2) : sin(arg2);
                        result += u_Ar2 * safePow(wave2, u_pr2) + u_Or2;
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
                        float arg1 = u_fx1 * TWO_PI * x + u_phi_x1;
                        float wave1 = (u_wave_x1 > 0.5) ? cos(arg1) : sin(arg1);
                        result += u_Ax1 * safePow(wave1, u_px1) + u_Ox1;
                    }
                    if (abs(u_Ax2) > 1e-9) {
                        float arg2 = u_fx2 * TWO_PI * x + u_phi_x2;
                        float wave2 = (u_wave_x2 > 0.5) ? cos(arg2) : sin(arg2);
                        result += u_Ax2 * safePow(wave2, u_px2) + u_Ox2;
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
                        float arg1 = u_fy1 * TWO_PI * y + u_phi_y1;
                        float wave1 = (u_wave_y1 > 0.5) ? cos(arg1) : sin(arg1);
                        result += u_Ay1 * safePow(wave1, u_py1) + u_Oy1;
                    }
                    if (abs(u_Ay2) > 1e-9) {
                        float arg2 = u_fy2 * TWO_PI * y + u_phi_y2;
                        float wave2 = (u_wave_y2 > 0.5) ? cos(arg2) : sin(arg2);
                        result += u_Ay2 * safePow(wave2, u_py2) + u_Oy2;
                    }
                    if (abs(u_My) > 1e-9) {
                        result += u_My * safePow(sin(u_fym1 * TWO_PI * y + u_phi_ym1), u_pym1) * 
                                        safePow(sin(u_fym2 * TWO_PI * y + u_phi_ym2), u_pym2);
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
                    
                    // Apply blend mode (controlled by uniform u_blendMode: 0=sum, 1=multiply)
                    float value = (u_blendMode > 0.5) ? (rVal * xVal * yVal) : (rVal + xVal + yVal);
                    float color = value > 0.0 ? 1.0 : 0.0;
                    
                    gl_FragColor = vec4(color, color, color, 1.0);
                }
            `;

      const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
      const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
      this.program = this.createProgram(vs, fs);

      // Setup geometry
      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
      );

      const posLoc = gl.getAttribLocation(this.program, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.useProgram(this.program);
    }

    createShader(type, source) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    createProgram(vs, fs) {
      const gl = this.gl;
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program error:", gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    draw(params) {
      const gl = this.gl;
      if (!gl || !this.program) return;

      const { scale, rotation = 0 } = this.config;

      gl.uniform2f(
        gl.getUniformLocation(this.program, "u_resolution"),
        this.canvas.width,
        this.canvas.height
      );
      gl.uniform1f(gl.getUniformLocation(this.program, "u_scale"), scale);
      gl.uniform1f(gl.getUniformLocation(this.program, "u_rotation"), rotation);

      // Blend mode
      const blendModeValue = this.config.blendMode === "multiply" ? 1.0 : 0.0;
      gl.uniform1f(
        gl.getUniformLocation(this.program, "u_blendMode"),
        blendModeValue
      );

      // R equation
      this.setUniform("u_Ar1", params.Ar1 || 0);
      this.setUniform("u_fr1", params.fr1 || 0);
      this.setUniform("u_pr1", params.pr1 || 1);
      this.setUniform("u_phi_r1", params.phi_r1 || 0);
      this.setUniform("u_Or1", params.Or1 || 0);
      this.setUniform("u_wave_r1", params.wave_r1 === "cos" ? 1.0 : 0.0);
      this.setUniform("u_Ar2", params.Ar2 || 0);
      this.setUniform("u_fr2", params.fr2 || 0);
      this.setUniform("u_pr2", params.pr2 || 1);
      this.setUniform("u_phi_r2", params.phi_r2 || 0);
      this.setUniform("u_Or2", params.Or2 || 0);
      this.setUniform("u_wave_r2", params.wave_r2 === "cos" ? 1.0 : 0.0);
      this.setUniform("u_Mr", params.Mr || 0);
      this.setUniform("u_frm1", params.frm1 || 0);
      this.setUniform("u_prm1", params.prm1 || 1);
      this.setUniform("u_phi_rm1", params.phi_rm1 || 0);
      this.setUniform("u_frm2", params.frm2 || 0);
      this.setUniform("u_prm2", params.prm2 || 1);
      this.setUniform("u_phi_rm2", params.phi_rm2 || 0);

      // X equation
      this.setUniform("u_Ax1", params.Ax1 || 0);
      this.setUniform("u_fx1", params.fx1 || 0);
      this.setUniform("u_px1", params.px1 || 1);
      this.setUniform("u_phi_x1", params.phi_x1 || 0);
      this.setUniform("u_Ox1", params.Ox1 || 0);
      this.setUniform("u_wave_x1", params.wave_x1 === "cos" ? 1.0 : 0.0);
      this.setUniform("u_Ax2", params.Ax2 || 0);
      this.setUniform("u_fx2", params.fx2 || 0);
      this.setUniform("u_px2", params.px2 || 1);
      this.setUniform("u_phi_x2", params.phi_x2 || 0);
      this.setUniform("u_Ox2", params.Ox2 || 0);
      this.setUniform("u_wave_x2", params.wave_x2 === "cos" ? 1.0 : 0.0);
      this.setUniform("u_Mx", params.Mx || 0);
      this.setUniform("u_fxm1", params.fxm1 || 0);
      this.setUniform("u_pxm1", params.pxm1 || 1);
      this.setUniform("u_phi_xm1", params.phi_xm1 || 0);
      this.setUniform("u_fxm2", params.fxm2 || 0);
      this.setUniform("u_pxm2", params.pxm2 || 1);
      this.setUniform("u_phi_xm2", params.phi_xm2 || 0);

      // Y equation
      this.setUniform("u_Ay1", params.Ay1 || 0);
      this.setUniform("u_fy1", params.fy1 || 0);
      this.setUniform("u_py1", params.py1 || 1);
      this.setUniform("u_phi_y1", params.phi_y1 || 0);
      this.setUniform("u_Oy1", params.Oy1 || 0);
      this.setUniform("u_wave_y1", params.wave_y1 === "cos" ? 1.0 : 0.0);
      this.setUniform("u_Ay2", params.Ay2 || 0);
      this.setUniform("u_fy2", params.fy2 || 0);
      this.setUniform("u_py2", params.py2 || 1);
      this.setUniform("u_phi_y2", params.phi_y2 || 0);
      this.setUniform("u_Oy2", params.Oy2 || 0);
      this.setUniform("u_wave_y2", params.wave_y2 === "cos" ? 1.0 : 0.0);
      this.setUniform("u_My", params.My || 0);
      this.setUniform("u_fym1", params.fym1 || 0);
      this.setUniform("u_pym1", params.pym1 || 1);
      this.setUniform("u_phi_ym1", params.phi_ym1 || 0);
      this.setUniform("u_fym2", params.fym2 || 0);
      this.setUniform("u_pym2", params.pym2 || 1);
      this.setUniform("u_phi_ym2", params.phi_ym2 || 0);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    setUniform(name, value) {
      const gl = this.gl;
      gl.uniform1f(gl.getUniformLocation(this.program, name), value);
    }
  }

  const dom = {
    canvas: document.getElementById("canvas"),
    canvasHud: document.getElementById("canvas-hud"),
    equationDisplay: document.getElementById("equation-display-interactive"),
    editorGrid: document.getElementById("editor-grid"),
    globalControls: document.getElementById("global-controls"),
    templateSelect: document.getElementById("template-select"),
    undoBtn: document.getElementById("undo-btn"),
    resetYBtn: document.getElementById("reset-y-btn"),
    exportSvgBtn: document.getElementById("export-svg-btn"),
    animateBtn: document.getElementById("animate-btn"),
    statusBar: document.getElementById("status-bar"),
    showAllParams: document.getElementById("show-all-params")
  };

  const renderer = new Renderer(dom.canvas, CONFIG.canvas);
  let webglRenderer = null;
  if (CONFIG.useGPU) {
    try {
      webglRenderer = new WebGLRenderer(dom.canvas, CONFIG.canvas);
      if (!webglRenderer.gl) webglRenderer = null;
    } catch (e) {
      console.warn("WebGL not available, using CPU renderer");
    }
  }
  let historyStack = [];
  let paramState = {};
  const controls = {};
  let renderTimeout;
  let isDragging = false;

  // Checkpoint system
  let checkpoints = [];
  let draggedCheckpointIndex = null;

  // Animation system
  let animationState = {
    playing: false,
    startTime: 0,
    mode: "none", // 'none', 'phase', 'sequence'

    // Phase animation - per parameter control
    phaseAnimations: {
      phi_r1: { enabled: false, speed: 1, direction: 1 },
      phi_r2: { enabled: false, speed: 1, direction: 1 },
      phi_x1: { enabled: false, speed: 1, direction: 1 },
      phi_x2: { enabled: false, speed: 1, direction: 1 },
      phi_y1: { enabled: false, speed: 1, direction: 1 },
      phi_y2: { enabled: false, speed: 1, direction: 1 }
    },
    phaseBaseValues: {}, // Store base values when animation starts

    // Sequence animation
    sequenceIndex: 0,
    sequenceStartTime: 0,
    sequenceLoop: true
  };

  const paramConfig = [
    { section: "R", label: "Ar₁", key: "Ar1", range: CONFIG.editor.ampRange },
    { section: "R", label: "fr₁", key: "fr1", range: CONFIG.editor.freqRange },
    {
      section: "R",
      label: "pr₁",
      key: "pr1",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "R",
      label: "φr₁",
      key: "phi_r1",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "R",
      label: "Or₁",
      key: "Or1",
      range: CONFIG.editor.offsetRange
    },
    {
      section: "R",
      label: "wave_r₁",
      key: "wave_r1",
      isToggle: true,
      options: ["sin", "cos"]
    },
    { section: "R", label: "Ar₂", key: "Ar2", range: CONFIG.editor.ampRange },
    { section: "R", label: "fr₂", key: "fr2", range: CONFIG.editor.freqRange },
    {
      section: "R",
      label: "pr₂",
      key: "pr2",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "R",
      label: "φr₂",
      key: "phi_r2",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "R",
      label: "Or₂",
      key: "Or2",
      range: CONFIG.editor.offsetRange
    },
    {
      section: "R",
      label: "wave_r₂",
      key: "wave_r2",
      isToggle: true,
      options: ["sin", "cos"]
    },
    { section: "R", label: "Mr", key: "Mr", range: CONFIG.editor.ampRange },
    {
      section: "R",
      label: "frm₁",
      key: "frm1",
      range: CONFIG.editor.freqRange
    },
    {
      section: "R",
      label: "prm₁",
      key: "prm1",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "R",
      label: "φrm₁",
      key: "phi_rm1",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "R",
      label: "frm₂",
      key: "frm2",
      range: CONFIG.editor.freqRange
    },
    {
      section: "R",
      label: "prm₂",
      key: "prm2",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "R",
      label: "φrm₂",
      key: "phi_rm2",
      range: CONFIG.editor.phaseRange
    },

    { section: "X", label: "Ax₁", key: "Ax1", range: CONFIG.editor.ampRange },
    { section: "X", label: "fx₁", key: "fx1", range: CONFIG.editor.freqRange },
    {
      section: "X",
      label: "px₁",
      key: "px1",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "X",
      label: "φx₁",
      key: "phi_x1",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "X",
      label: "Ox₁",
      key: "Ox1",
      range: CONFIG.editor.offsetRange
    },
    {
      section: "X",
      label: "wave_x₁",
      key: "wave_x1",
      isToggle: true,
      options: ["sin", "cos"]
    },
    { section: "X", label: "Ax₂", key: "Ax2", range: CONFIG.editor.ampRange },
    { section: "X", label: "fx₂", key: "fx2", range: CONFIG.editor.freqRange },
    {
      section: "X",
      label: "px₂",
      key: "px2",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "X",
      label: "φx₂",
      key: "phi_x2",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "X",
      label: "Ox₂",
      key: "Ox2",
      range: CONFIG.editor.offsetRange
    },
    {
      section: "X",
      label: "wave_x₂",
      key: "wave_x2",
      isToggle: true,
      options: ["sin", "cos"]
    },
    { section: "X", label: "Mx", key: "Mx", range: CONFIG.editor.ampRange },
    {
      section: "X",
      label: "fxm₁",
      key: "fxm1",
      range: CONFIG.editor.freqRange
    },
    {
      section: "X",
      label: "pxm₁",
      key: "pxm1",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "X",
      label: "φxm₁",
      key: "phi_xm1",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "X",
      label: "fxm₂",
      key: "fxm2",
      range: CONFIG.editor.freqRange
    },
    {
      section: "X",
      label: "pxm₂",
      key: "pxm2",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "X",
      label: "φxm₂",
      key: "phi_xm2",
      range: CONFIG.editor.phaseRange
    },

    { section: "Y", label: "Ay₁", key: "Ay1", range: CONFIG.editor.ampRange },
    { section: "Y", label: "fy₁", key: "fy1", range: CONFIG.editor.freqRange },
    {
      section: "Y",
      label: "py₁",
      key: "py1",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "Y",
      label: "φy₁",
      key: "phi_y1",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "Y",
      label: "Oy₁",
      key: "Oy1",
      range: CONFIG.editor.offsetRange
    },
    {
      section: "Y",
      label: "wave_y₁",
      key: "wave_y1",
      isToggle: true,
      options: ["sin", "cos"]
    },
    { section: "Y", label: "Ay₂", key: "Ay2", range: CONFIG.editor.ampRange },
    { section: "Y", label: "fy₂", key: "fy2", range: CONFIG.editor.freqRange },
    {
      section: "Y",
      label: "py₂",
      key: "py2",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "Y",
      label: "φy₂",
      key: "phi_y2",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "Y",
      label: "Oy₂",
      key: "Oy2",
      range: CONFIG.editor.offsetRange
    },
    {
      section: "Y",
      label: "wave_y₂",
      key: "wave_y2",
      isToggle: true,
      options: ["sin", "cos"]
    },
    { section: "Y", label: "My", key: "My", range: CONFIG.editor.ampRange },
    {
      section: "Y",
      label: "fym₁",
      key: "fym1",
      range: CONFIG.editor.freqRange
    },
    {
      section: "Y",
      label: "pym₁",
      key: "pym1",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "Y",
      label: "φym₁",
      key: "phi_ym1",
      range: CONFIG.editor.phaseRange
    },
    {
      section: "Y",
      label: "fym₂",
      key: "fym2",
      range: CONFIG.editor.freqRange
    },
    {
      section: "Y",
      label: "pym₂",
      key: "pym2",
      range: CONFIG.editor.powerRange,
      isPower: true
    },
    {
      section: "Y",
      label: "φym₂",
      key: "phi_ym2",
      range: CONFIG.editor.phaseRange
    }
  ];

  const globalConfig = [
    { label: "Scale", key: "scale", range: { min: 50, max: 500, step: 10 } },
    {
      label: "Rotation",
      key: "rotation",
      range: { min: 0, max: 360, step: 1 }
    },
    {
      label: "Blend",
      key: "blendMode",
      isToggle: true,
      options: ["sum", "multiply"]
    }
  ];

  function getFinalParams() {
    return paramState;
  }

  function redraw(isDebounced = false) {
    clearTimeout(renderTimeout);
    const delay = isDebounced ? 100 : 0;
    renderTimeout = setTimeout(() => {
      const startTime = performance.now();
      const finalParams = getFinalParams();

      if (webglRenderer) {
        // Use WebGL - always fast, no draft mode needed
        webglRenderer.draw(finalParams);
      } else {
        // Use CPU renderer with draft mode when dragging
        const equation = new SpatialEquation(finalParams);
        renderer.draw(equation, isDebounced);
      }

      const endTime = performance.now();
      const renderTime = (endTime - startTime).toFixed(1);
      const method = webglRenderer
        ? "GPU"
        : isDebounced
        ? "CPU (draft)"
        : "CPU";
      dom.statusBar.textContent = `Rendered in ${renderTime}ms (${method})`;
      updateEquationDisplay();
    }, delay);
  }

  function exportSVG() {
    const { size, scale, rotation } = CONFIG.canvas;
    const finalParams = getFinalParams();
    const equation = new SpatialEquation(finalParams);
    const halfSize = size / 2;

    // Trace contours
    const paths = [];
    const resolution = 2; // Sample every 2 pixels for smoother SVG

    for (let py = 0; py < size; py += resolution) {
      for (let px = 0; px < size; px += resolution) {
        let x = (px - halfSize) / scale;
        let y = (py - halfSize) / scale;

        if (rotation !== 0) {
          const rad = (rotation * Math.PI) / 180;
          const cosR = Math.cos(rad);
          const sinR = Math.sin(rad);
          const xRot = x * cosR - y * sinR;
          const yRot = x * sinR + y * cosR;
          x = xRot;
          y = yRot;
        }

        const r = Math.sqrt(x * x + y * y);
        const value =
          equation.evaluateR(r) + equation.evaluateX(x) + equation.evaluateY(y);
        const isBlack = value <= 0;

        if (isBlack) {
          paths.push(
            `M${px},${py} h${resolution} v${resolution} h${-resolution}Z`
          );
        }
      }
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" fill="white"/>
<path d="${paths.join(" ")}" fill="black"/>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pattern-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Checkpoint management
  function saveCheckpoint() {
    checkpoints.push({
      name: `Checkpoint ${checkpoints.length + 1}`,
      params: JSON.parse(JSON.stringify(paramState)),
      duration: 3, // Default duration to this checkpoint (seconds)
      timestamp: Date.now()
    });

    updateCheckpointUI();
    dom.statusBar.textContent = `Saved checkpoint ${checkpoints.length}`;
  }

  function loadCheckpoint(index) {
    if (index < 0 || index >= checkpoints.length) return;

    pushToHistory();
    paramState = JSON.parse(JSON.stringify(checkpoints[index].params));
    updateAllControls();
    redraw();
    dom.statusBar.textContent = `Loaded checkpoint: ${checkpoints[index].name}`;
  }

  function deleteCheckpoint(index) {
    if (index < 0 || index >= checkpoints.length) return;
    const name = checkpoints[index].name;
    checkpoints.splice(index, 1);
    updateCheckpointUI();
    dom.statusBar.textContent = `Deleted checkpoint: ${name}`;
  }

  function duplicateCheckpoint(index) {
    if (index < 0 || index >= checkpoints.length) return;
    const original = checkpoints[index];
    const copy = {
      name: original.name + " (copy)",
      params: JSON.parse(JSON.stringify(original.params)),
      duration: original.duration,
      timestamp: Date.now()
    };
    checkpoints.splice(index + 1, 0, copy);
    updateCheckpointUI();
    dom.statusBar.textContent = `Duplicated checkpoint: ${original.name}`;
  }

  function editCheckpoint(index) {
    if (index < 0 || index >= checkpoints.length) return;
    const cp = checkpoints[index];

    // Load checkpoint parameters into editor
    pushToHistory();
    paramState = JSON.parse(JSON.stringify(cp.params));
    updateAllControls();
    redraw();

    dom.statusBar.textContent = `Editing checkpoint: ${cp.name} (modify parameters and Save Checkpoint to update)`;
  }

  function renameCheckpoint(index, newName) {
    if (index < 0 || index >= checkpoints.length) return;
    if (newName && newName.trim()) {
      checkpoints[index].name = newName.trim();
    }
  }

  function updateCheckpointDuration(index, duration) {
    if (index < 0 || index >= checkpoints.length) return;
    checkpoints[index].duration = parseFloat(duration);
  }

  function moveCheckpoint(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const item = checkpoints.splice(fromIndex, 1)[0];
    checkpoints.splice(toIndex, 0, item);
    updateCheckpointUI();
  }

  function updateCheckpointUI() {
    const container = document.getElementById("checkpoint-list");
    if (!container) return;

    container.innerHTML = "";

    if (checkpoints.length === 0) {
      container.innerHTML =
        '<div style="opacity: 0.5; padding: 10px; font-size: 12px;">No checkpoints saved</div>';
      return;
    }

    checkpoints.forEach((cp, i) => {
      const item = document.createElement("div");
      item.className = "checkpoint-item";
      item.draggable = true;
      item.dataset.index = i;

      item.innerHTML = `
                <div class="checkpoint-drag-handle">⋮⋮</div>
                <div class="checkpoint-info">
                    <div class="checkpoint-name">
                        <input type="text" 
                               value="${cp.name}" 
                               class="checkpoint-name-input"
                               onchange="window.renameCheckpoint(${i}, this.value)"
                               onclick="event.stopPropagation()">
                    </div>
                    <div class="checkpoint-duration">
                        <label>Duration: 
                            <input type="number" 
                                   value="${cp.duration}" 
                                   min="0.1" 
                                   max="60" 
                                   step="0.5"
                                   onchange="window.updateCheckpointDuration(${i}, this.value)"
                                   onclick="event.stopPropagation()">s
                        </label>
                    </div>
                </div>
                <div class="checkpoint-actions">
                    <button class="tool-btn" onclick="window.loadCheckpoint(${i})" title="Load">Load</button>
                    <button class="tool-btn" onclick="window.editCheckpoint(${i})" title="Edit Parameters">✎</button>
                    <button class="tool-btn" onclick="window.duplicateCheckpoint(${i})" title="Duplicate">⎘</button>
                    <button class="tool-btn" onclick="window.deleteCheckpoint(${i})" title="Delete">×</button>
                </div>
            `;

      // Drag and drop handlers
      item.addEventListener("dragstart", (e) => {
        draggedCheckpointIndex = i;
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      item.addEventListener("dragend", (e) => {
        item.classList.remove("dragging");
        draggedCheckpointIndex = null;
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const afterElement = getDragAfterElement(container, e.clientY);
        const draggingElement = document.querySelector(".dragging");

        if (afterElement == null) {
          container.appendChild(draggingElement);
        } else {
          container.insertBefore(draggingElement, afterElement);
        }
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        const dropIndex = parseInt(item.dataset.index);
        if (
          draggedCheckpointIndex !== null &&
          draggedCheckpointIndex !== dropIndex
        ) {
          moveCheckpoint(draggedCheckpointIndex, dropIndex);
        }
      });

      container.appendChild(item);
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".checkpoint-item:not(.dragging)")
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function setTweenPoint(index, point) {
    if (point === "from") {
      animationState.tweenFrom = index;
      dom.statusBar.textContent = `Tween start: ${checkpoints[index].name}`;
    } else {
      animationState.tweenTo = index;
      dom.statusBar.textContent = `Tween end: ${checkpoints[index].name}`;
    }
    updateTweenUI();
  }

  function updateTweenUI() {
    const fromName =
      animationState.tweenFrom !== null
        ? checkpoints[animationState.tweenFrom]?.name
        : "None";
    const toName =
      animationState.tweenTo !== null
        ? checkpoints[animationState.tweenTo]?.name
        : "None";

    const info = document.getElementById("tween-info");
    if (info) {
      info.textContent = `From: ${fromName} → To: ${toName}`;
    }
  }

  function interpolateParams(paramsA, paramsB, t) {
    const result = {};
    const keys = new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]);

    keys.forEach((key) => {
      const a = paramsA[key] || 0;
      const b = paramsB[key] || 0;
      result[key] = a + (b - a) * t;
    });

    return result;
  }

  // Animation system
  function startAnimation() {
    if (animationState.playing) return;

    const mode = document.querySelector('input[name="anim-mode"]:checked')
      ?.value;

    // Check if any phase animations are enabled
    const hasPhaseEnabled = Object.values(animationState.phaseAnimations).some(
      (p) => p.enabled
    );

    if (!hasPhaseEnabled && mode === "sequence" && checkpoints.length < 2) {
      dom.statusBar.textContent =
        "Need at least 2 checkpoints for sequence animation";
      return;
    }

    if (!hasPhaseEnabled && mode === "none") {
      dom.statusBar.textContent =
        "Enable phase animation or select sequence mode";
      return;
    }

    animationState.mode = mode;
    animationState.playing = true;
    animationState.startTime = performance.now();
    animationState.sequenceIndex = 0;
    animationState.sequenceStartTime = performance.now();

    // Store base phase values
    animationState.phaseBaseValues = {};
    Object.keys(animationState.phaseAnimations).forEach((key) => {
      animationState.phaseBaseValues[key] = paramState[key] || 0;
    });

    dom.animateBtn.textContent = "Stop";
    animateFrame();
  }

  function stopAnimation() {
    animationState.playing = false;
    dom.animateBtn.textContent = "Start";
  }

  function animateFrame() {
    if (!animationState.playing) return;

    const elapsed = (performance.now() - animationState.startTime) / 1000;

    // Apply phase animations (always runs if any enabled, independent of mode)
    Object.keys(animationState.phaseAnimations).forEach((key) => {
      const phaseAnim = animationState.phaseAnimations[key];
      if (phaseAnim.enabled && controls[key]) {
        const baseValue = animationState.phaseBaseValues[key];
        // Linear increment: phase = base + speed * direction * time * 2π
        const phaseIncrement =
          elapsed * phaseAnim.speed * phaseAnim.direction * Math.PI * 2;
        const newPhase = baseValue + phaseIncrement;

        // Wrap to [-2π, 2π] to prevent overflow
        const wrappedPhase =
          ((newPhase + Math.PI * 2) % (Math.PI * 4)) - Math.PI * 2;

        paramState[key] = wrappedPhase;
        controls[key].slider.value = wrappedPhase;
        controls[key].numberInput.value = wrappedPhase.toFixed(2);
      }
    });

    // Apply sequence animation (if mode is sequence)
    if (animationState.mode === "sequence" && checkpoints.length >= 2) {
      const segmentElapsed =
        (performance.now() - animationState.sequenceStartTime) / 1000;

      const currentIndex = animationState.sequenceIndex;
      const nextIndex = (currentIndex + 1) % checkpoints.length;
      const duration = checkpoints[nextIndex].duration;

      if (segmentElapsed >= duration) {
        // Move to next checkpoint
        animationState.sequenceIndex = nextIndex;
        animationState.sequenceStartTime = performance.now();

        // Update base phase values for the new checkpoint
        Object.keys(animationState.phaseAnimations).forEach((key) => {
          if (animationState.phaseAnimations[key].enabled) {
            animationState.phaseBaseValues[key] =
              checkpoints[nextIndex].params[key] || 0;
          }
        });

        // If we've looped back to start and not looping, stop
        if (nextIndex === 0 && !animationState.sequenceLoop) {
          stopAnimation();
          return;
        }
      } else {
        // Interpolate between current and next checkpoint
        let t = segmentElapsed / duration;

        // Easing (smoothstep)
        t = t * t * (3 - 2 * t);

        const fromParams = checkpoints[currentIndex].params;
        const toParams = checkpoints[nextIndex].params;
        const interpolated = interpolateParams(fromParams, toParams, t);

        // Update non-phase parameters (phase handled separately above)
        Object.keys(interpolated).forEach((key) => {
          if (
            !animationState.phaseAnimations.hasOwnProperty(key) &&
            controls[key]
          ) {
            paramState[key] = interpolated[key];
            controls[key].slider.value = interpolated[key];
            const decimals =
              controls[key].numberInput.step < 0.1
                ? 2
                : controls[key].numberInput.step < 1
                ? 1
                : 0;
            controls[key].numberInput.value = interpolated[key].toFixed(
              decimals
            );
          }
        });
      }
    }

    redraw(false);
    requestAnimationFrame(animateFrame);
  }

  function updateControlsFromParams(params) {
    Object.keys(params).forEach((key) => {
      if (controls[key]) {
        paramState[key] = params[key];
        controls[key].slider.value = params[key];
        const decimals =
          controls[key].numberInput.step < 0.1
            ? 2
            : controls[key].numberInput.step < 1
            ? 1
            : 0;
        controls[key].numberInput.value = params[key].toFixed(decimals);
      }
    });
  }

  // Expose functions globally for HTML onclick handlers
  window.loadCheckpoint = loadCheckpoint;
  window.deleteCheckpoint = deleteCheckpoint;
  window.duplicateCheckpoint = duplicateCheckpoint;
  window.editCheckpoint = editCheckpoint;
  window.renameCheckpoint = renameCheckpoint;
  window.updateCheckpointDuration = updateCheckpointDuration;
  window.setTweenPoint = setTweenPoint;

  // Parameter tabs
  let currentTab = "r";

  function updateClearButtonText() {
    const eqName =
      currentTab === "r"
        ? "R"
        : currentTab === "x"
        ? "X"
        : currentTab === "y"
        ? "Y"
        : "Current";
    dom.resetYBtn.textContent = `Clear ${eqName} Equation`;
  }

  function setupTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.dataset.tab;
        updateParameterVisibility();
        updateClearButtonText();
      });
    });
  }

  function updateParameterVisibility() {
    const showAll = dom.showAllParams.checked;
    const rows = document.querySelectorAll(".param-row");

    rows.forEach((row) => {
      const section = row.dataset.section;
      const key = row.dataset.key;

      if (!section || !key) return;

      // Tab filtering
      let inCurrentTab = false;
      if (currentTab === "global") {
        inCurrentTab = section === "global";
      } else {
        inCurrentTab = section === currentTab;
      }

      // Smart visibility filtering
      let isActive = true;
      if (!showAll && section !== "global") {
        const value = paramState[key];
        // Hide if value is effectively zero (considering power defaults to 1)
        if (key.startsWith("p") && key.length <= 5) {
          isActive = Math.abs(value - 1) > 0.01;
        } else {
          isActive = Math.abs(value || 0) > 0.01;
        }
      }

      row.classList.toggle("hidden", !inCurrentTab || !isActive);
    });
  }

  // Preset toolbar functions
  window.adjustFrequency = function (delta) {
    pushToHistory();
    ["fr1", "fr2", "fx1", "fx2", "fy1", "fy2"].forEach((key) => {
      if (Math.abs(paramState[key] || 0) > 0.01 || delta > 0) {
        paramState[key] = Math.max(0, (paramState[key] || 0) + delta);
      }
    });
    updateAllControls();
    redraw();
  };

  window.invertAmplitude = function () {
    pushToHistory();
    ["Ar1", "Ar2", "Ax1", "Ax2", "Ay1", "Ay2"].forEach((key) => {
      if (Math.abs(paramState[key] || 0) > 0.01) {
        paramState[key] = -paramState[key];
      }
    });
    updateAllControls();
    redraw();
  };

  window.doubleFrequency = function () {
    pushToHistory();
    ["fr1", "fr2", "fx1", "fx2", "fy1", "fy2"].forEach((key) => {
      if (Math.abs(paramState[key] || 0) > 0.01) {
        paramState[key] = paramState[key] * 2;
      }
    });
    updateAllControls();
    redraw();
  };

  window.halveFrequency = function () {
    pushToHistory();
    ["fr1", "fr2", "fx1", "fx2", "fy1", "fy2"].forEach((key) => {
      if (Math.abs(paramState[key] || 0) > 0.01) {
        paramState[key] = paramState[key] / 2;
      }
    });
    updateAllControls();
    redraw();
  };

  window.clearAll = function () {
    pushToHistory();
    paramState = getDefaultState();
    updateAllControls();
    redraw();
  };

  // Keyboard shortcuts
  function setupKeyboardShortcuts() {
    let focusedParam = null;

    document.addEventListener("keydown", (e) => {
      // Don't handle shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" && e.target.type !== "range") return;

      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+S: Save checkpoint
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveCheckpoint();
        return;
      }

      // Space: Play/Pause animation
      if (e.key === " " && e.target.tagName !== "INPUT") {
        e.preventDefault();
        if (animationState.playing) {
          stopAnimation();
        } else {
          startAnimation();
        }
        return;
      }

      // Arrow keys: Adjust focused parameter
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const activeElement = document.activeElement;
        if (activeElement.type === "range") {
          e.preventDefault();
          const slider = activeElement;
          const step = e.shiftKey
            ? parseFloat(slider.step) * 10
            : e.ctrlKey
            ? parseFloat(slider.step) * 0.1
            : parseFloat(slider.step);
          const delta = e.key === "ArrowUp" ? step : -step;
          const newValue = parseFloat(slider.value) + delta;
          slider.value = Math.max(
            parseFloat(slider.min),
            Math.min(parseFloat(slider.max), newValue)
          );
          slider.dispatchEvent(new Event("input"));
        }
      }

      // Tab: Cycle through sliders
      if (e.key === "Tab" && !e.shiftKey) {
        const sliders = Array.from(
          document.querySelectorAll('input[type="range"]:not(.hidden)')
        );
        const currentIndex = sliders.indexOf(document.activeElement);
        if (currentIndex >= 0) {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % sliders.length;
          sliders[nextIndex].focus();
        }
      }
    });
  }

  function updateEquationDisplay() {
    const p = getFinalParams();
    const fmt = (n) =>
      Math.abs(n - Math.round(n)) < 0.01 ? Math.round(n) : n.toFixed(2);

    const createEditableNumber = (value, key, colorClass) => {
      return `<span class="eq-number ${colorClass}" data-param="${key}" data-value="${value}">${fmt(
        value
      )}</span>`;
    };

    const formatPhaseEditable = (phaseValue, phaseKey, colorClass) => {
      if (Math.abs(phaseValue) < 0.01) return "";
      const sign = phaseValue > 0 ? "+" : "";
      return `${sign}${createEditableNumber(phaseValue, phaseKey, colorClass)}`;
    };

    const formatPowerEditable = (powerValue, powerKey, colorClass) => {
      if (Math.abs(powerValue - 1) < 0.01) return ""; // Don't show if power=1
      return `<sup>${createEditableNumber(
        powerValue,
        powerKey,
        colorClass
      )}</sup>`;
    };

    const formatWaveFunc = (waveType) => {
      return waveType === "cos" ? "cos" : "sin";
    };

    // Build interactive R equation
    let rEq = "0";
    if (Math.abs(p.Ar1) > 0.01 || Math.abs(p.fr1) > 0.01) {
      const phaseStr = formatPhaseEditable(p.phi_r1 || 0, "phi_r1", "eq-r");
      const powerStr = formatPowerEditable(p.pr1 || 1, "pr1", "eq-r");
      const waveFunc = formatWaveFunc(p.wave_r1 || "sin");
      rEq = `${createEditableNumber(
        p.Ar1,
        "Ar1",
        "eq-r"
      )}·${waveFunc}${powerStr}(${createEditableNumber(
        p.fr1,
        "fr1",
        "eq-r"
      )}×2π×r${phaseStr})`;
      if (Math.abs(p.Or1 || 0) > 0.01) {
        rEq += `${p.Or1 > 0 ? "+" : ""}${createEditableNumber(
          p.Or1,
          "Or1",
          "eq-r"
        )}`;
      }
    }
    if (Math.abs(p.Ar2) > 0.01 || Math.abs(p.fr2) > 0.01) {
      const sign = p.Ar2 > 0 ? "+" : "";
      const phaseStr = formatPhaseEditable(p.phi_r2 || 0, "phi_r2", "eq-r");
      const powerStr = formatPowerEditable(p.pr2 || 1, "pr2", "eq-r");
      const waveFunc = formatWaveFunc(p.wave_r2 || "sin");
      rEq += ` ${sign}${createEditableNumber(
        p.Ar2,
        "Ar2",
        "eq-r"
      )}·${waveFunc}${powerStr}(${createEditableNumber(
        p.fr2,
        "fr2",
        "eq-r"
      )}×2π×r${phaseStr})`;
    }

    // Build interactive X equation
    let xEq = "0";
    if (Math.abs(p.Ax1) > 0.01 || Math.abs(p.fx1) > 0.01) {
      const phaseStr = formatPhaseEditable(p.phi_x1 || 0, "phi_x1", "eq-x");
      const powerStr = formatPowerEditable(p.px1 || 1, "px1", "eq-x");
      const waveFunc = formatWaveFunc(p.wave_x1 || "sin");
      xEq = `${createEditableNumber(
        p.Ax1,
        "Ax1",
        "eq-x"
      )}·${waveFunc}${powerStr}(${createEditableNumber(
        p.fx1,
        "fx1",
        "eq-x"
      )}×2π×x${phaseStr})`;
      if (Math.abs(p.Ox1 || 0) > 0.01) {
        xEq += `${p.Ox1 > 0 ? "+" : ""}${createEditableNumber(
          p.Ox1,
          "Ox1",
          "eq-x"
        )}`;
      }
    }
    if (Math.abs(p.Ax2) > 0.01 || Math.abs(p.fx2) > 0.01) {
      const sign = p.Ax2 > 0 ? "+" : "";
      const phaseStr = formatPhaseEditable(p.phi_x2 || 0, "phi_x2", "eq-x");
      const powerStr = formatPowerEditable(p.px2 || 1, "px2", "eq-x");
      const waveFunc = formatWaveFunc(p.wave_x2 || "sin");
      xEq += ` ${sign}${createEditableNumber(
        p.Ax2,
        "Ax2",
        "eq-x"
      )}·${waveFunc}${powerStr}(${createEditableNumber(
        p.fx2,
        "fx2",
        "eq-x"
      )}×2π×x${phaseStr})`;
    }

    // Build interactive Y equation
    let yEq = "0";
    if (Math.abs(p.Ay1) > 0.01 || Math.abs(p.fy1) > 0.01) {
      const phaseStr = formatPhaseEditable(p.phi_y1 || 0, "phi_y1", "eq-y");
      const powerStr = formatPowerEditable(p.py1 || 1, "py1", "eq-y");
      const waveFunc = formatWaveFunc(p.wave_y1 || "sin");
      yEq = `${createEditableNumber(
        p.Ay1,
        "Ay1",
        "eq-y"
      )}·${waveFunc}${powerStr}(${createEditableNumber(
        p.fy1,
        "fy1",
        "eq-y"
      )}×2π×y${phaseStr})`;
      if (Math.abs(p.Oy1 || 0) > 0.01) {
        yEq += `${p.Oy1 > 0 ? "+" : ""}${createEditableNumber(
          p.Oy1,
          "Oy1",
          "eq-y"
        )}`;
      }
    }
    if (Math.abs(p.Ay2) > 0.01 || Math.abs(p.fy2) > 0.01) {
      const sign = p.Ay2 > 0 ? "+" : "";
      const phaseStr = formatPhaseEditable(p.phi_y2 || 0, "phi_y2", "eq-y");
      const powerStr = formatPowerEditable(p.py2 || 1, "py2", "eq-y");
      const waveFunc = formatWaveFunc(p.wave_y2 || "sin");
      yEq += ` ${sign}${createEditableNumber(
        p.Ay2,
        "Ay2",
        "eq-y"
      )}·${waveFunc}${powerStr}(${createEditableNumber(
        p.fy2,
        "fy2",
        "eq-y"
      )}×2π×y${phaseStr})`;
    }

    const blendMode = CONFIG.canvas.blendMode || "sum";
    const blendOp = blendMode === "multiply" ? "×" : "+";

    dom.equationDisplay.innerHTML = `
            <div class="eq-line"><span class="eq-variable eq-r">r(r) =</span> ${rEq}</div>
            <div class="eq-line"><span class="eq-variable eq-x">x(x) =</span> ${xEq}</div>
            <div class="eq-line"><span class="eq-variable eq-y">y(y) =</span> ${yEq}</div>
            <div class="eq-threshold">value = r(r) ${blendOp} x(x) ${blendOp} y(y) > 0 ? white : black</div>
        `;

    // Add click handlers to editable numbers
    dom.equationDisplay.querySelectorAll(".eq-number").forEach((span) => {
      span.addEventListener("click", (e) => {
        e.stopPropagation();
        makeNumberEditable(span);
      });
    });

    updateHUD();
  }

  function makeNumberEditable(span) {
    if (span.querySelector("input")) return; // Already editing

    const param = span.dataset.param;
    const value = parseFloat(span.dataset.value);
    const input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.step = 0.1;

    span.classList.add("editing");
    span.textContent = "";
    span.appendChild(input);
    input.focus();
    input.select();

    const finish = () => {
      const newValue = parseFloat(input.value);
      if (!isNaN(newValue) && newValue !== value) {
        pushToHistory();
        paramState[param] = newValue;
        if (controls[param]) {
          controls[param].slider.value = newValue;
          const decimals =
            controls[param].numberInput.step < 0.1
              ? 2
              : controls[param].numberInput.step < 1
              ? 1
              : 0;
          controls[param].numberInput.value = newValue.toFixed(decimals);
        }
        redraw();
      } else {
        updateEquationDisplay();
      }
    };

    input.addEventListener("blur", finish);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finish();
      } else if (e.key === "Escape") {
        updateEquationDisplay();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        input.value =
          parseFloat(input.value) + (e.shiftKey ? 10 : e.ctrlKey ? 0.1 : 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        input.value =
          parseFloat(input.value) - (e.shiftKey ? 10 : e.ctrlKey ? 0.1 : 1);
      }
    });
  }

  function updateHUD() {
    const p = getFinalParams();
    const active = [];

    if (Math.abs(p.Ar1) > 0.01)
      active.push(`R: A=${p.Ar1.toFixed(1)} f=${p.fr1.toFixed(1)}`);
    if (Math.abs(p.Ar2) > 0.01)
      active.push(`R2: A=${p.Ar2.toFixed(1)} f=${p.fr2.toFixed(1)}`);
    if (Math.abs(p.Ax1) > 0.01)
      active.push(`X: A=${p.Ax1.toFixed(1)} f=${p.fx1.toFixed(1)}`);
    if (Math.abs(p.Ax2) > 0.01)
      active.push(`X2: A=${p.Ax2.toFixed(1)} f=${p.fx2.toFixed(1)}`);
    if (Math.abs(p.Ay1) > 0.01)
      active.push(`Y: A=${p.Ay1.toFixed(1)} f=${p.fy1.toFixed(1)}`);
    if (Math.abs(p.Ay2) > 0.01)
      active.push(`Y2: A=${p.Ay2.toFixed(1)} f=${p.fy2.toFixed(1)}`);

    if (active.length === 0) {
      active.push("All parameters = 0");
    }

    active.push(`Scale: ${CONFIG.canvas.scale}`);
    active.push(`Rotation: ${CONFIG.canvas.rotation}°`);

    dom.canvasHud.textContent = active.join("\n");
  }

  function pushToHistory() {
    historyStack.push(
      JSON.parse(JSON.stringify({ state: paramState, config: CONFIG.canvas }))
    );
    if (historyStack.length > 50) historyStack.shift();
    dom.undoBtn.disabled = false;
  }

  function undo() {
    if (historyStack.length === 0) return;
    const last = historyStack.pop();
    paramState = last.state;
    CONFIG.canvas = last.config;
    updateAllControls();
    redraw();
    dom.undoBtn.disabled = historyStack.length === 0;
  }

  function createToggleControl(key, options, isGlobal = false) {
    const container = document.createElement("div");
    container.className = "controls toggle-control";

    const btnGroup = document.createElement("div");
    btnGroup.className = "toggle-btn-group";

    const updateState = (value) => {
      if (isGlobal) {
        CONFIG.canvas[key] = value;
      } else {
        paramState[key] = value;
      }

      // Update button states
      btnGroup.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === value);
      });

      redraw(false);
    };

    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.className = "toggle-btn";
      btn.dataset.value = opt;
      btn.addEventListener("click", () => {
        pushToHistory();
        updateState(opt);
      });
      btnGroup.appendChild(btn);
    });

    container.appendChild(btnGroup);
    controls[key] = {
      update: (v) => updateState(v),
      element: btnGroup
    };
    return container;
  }

  function createParamControl(key, range, isGlobal = false) {
    const container = document.createElement("div");
    container.className = "controls";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = range.min;
    slider.max = range.max;
    slider.step = range.step;

    const number = document.createElement("input");
    number.type = "number";
    number.min = range.min;
    number.max = range.max;
    number.step = range.step;

    const updateState = (valStr, isDebounced) => {
      let val = parseFloat(valStr) || 0;
      if (controls[key] && controls[key].isInt) val = Math.round(val);
      val = Math.max(range.min, Math.min(range.max, val));

      if (isGlobal) {
        CONFIG.canvas[key] = val;
      } else {
        paramState[key] = val;
      }

      slider.value = val;
      // Format based on step size
      let decimals = 0;
      if (range.step <= 0.01) decimals = 2;
      else if (range.step < 1) decimals = 1;
      number.value = val.toFixed(decimals);
      redraw(isDebounced);
    };

    slider.addEventListener("input", (e) => updateState(e.target.value, true));
    slider.addEventListener("change", () => {
      redraw(false);
      pushToHistory();
    });
    number.addEventListener("change", (e) => {
      updateState(e.target.value, false);
      pushToHistory();
    });

    container.append(slider, number);
    controls[key] = {
      slider,
      numberInput: number,
      update: (v) => updateState(String(v), false),
      isInt: false
    };
    return container;
  }

  function createEditor() {
    paramConfig.forEach((p) => {
      const row = document.createElement("div");
      row.className = "param-row";
      row.dataset.section = p.section.toLowerCase();
      row.dataset.key = p.key;

      const label = document.createElement("div");
      label.className = `param-label param-${p.section.toLowerCase()}`;
      label.textContent = p.label;
      label.dataset.section = p.section.toLowerCase();
      label.dataset.key = p.key;

      const control = p.isToggle
        ? createToggleControl(p.key, p.options)
        : createParamControl(p.key, p.range);

      if (p.isPower && !p.isToggle) {
        const intBtn = document.createElement("button");
        intBtn.textContent = "I";
        intBtn.className = "tool-btn";
        intBtn.title = "Lock to Integer";

        const ctrl = controls[p.key];
        intBtn.addEventListener("click", () => {
          ctrl.isInt = !ctrl.isInt;
          intBtn.classList.toggle("active", ctrl.isInt);
          ctrl.update(ctrl.numberInput.value);
          pushToHistory();
        });

        control.appendChild(intBtn);
      }

      row.appendChild(label);
      row.appendChild(control);
      dom.editorGrid.appendChild(row);
    });

    globalConfig.forEach((gc) => {
      const row = document.createElement("div");
      row.className = "param-row";
      row.dataset.section = "global";
      row.dataset.key = gc.key;

      const label = document.createElement("div");
      label.className = "param-label";
      label.textContent = gc.label;
      label.dataset.section = "global";
      label.dataset.key = gc.key;

      const control = gc.isToggle
        ? createToggleControl(gc.key, gc.options, true)
        : createParamControl(gc.key, gc.range, true);

      row.appendChild(label);
      row.appendChild(control);
      dom.globalControls.appendChild(row);
    });
  }

  function getDefaultState() {
    const state = {};
    paramConfig.forEach((p) => {
      if (p.isToggle) {
        state[p.key] = p.options[0]; // Default to first option (sin)
      } else {
        // Set default value: 1 for power params, 0 for others
        state[p.key] = p.key.startsWith("p") && p.key.length <= 5 ? 1 : 0;
      }
    });
    return state;
  }

  function updateAllControls() {
    Object.keys(controls).forEach((key) => {
      let val =
        CONFIG.canvas[key] !== undefined ? CONFIG.canvas[key] : paramState[key];
      if (val !== undefined && controls[key]) controls[key].update(val);
    });
  }

  function initialize() {
    paramState = getDefaultState();
    // Set default to 20 concentric rings
    paramState.Ar1 = 1;
    paramState.fr1 = 20;
    paramState.pr1 = 1;

    createEditor();
    updateAllControls();
    updateParameterVisibility();
    redraw();

    dom.undoBtn.addEventListener("click", undo);

    dom.resetYBtn.addEventListener("click", () => {
      pushToHistory();

      // Determine which equation to clear based on current tab
      const eqPrefix =
        currentTab === "r"
          ? "Ar,fr,pr,phi_r,Or"
          : currentTab === "x"
          ? "Ax,fx,px,phi_x,Ox"
          : currentTab === "y"
          ? "Ay,fy,py,phi_y,Oy"
          : "";

      if (!eqPrefix) return;

      // Clear all parameters for the selected equation
      const prefixes = eqPrefix.split(",");
      Object.keys(paramState).forEach((k) => {
        prefixes.forEach((prefix) => {
          if (k.startsWith(prefix)) {
            paramState[k] = k.startsWith("p") && k.length <= 4 ? 1 : 0;
          }
        });
      });

      updateAllControls();
      redraw();
    });

    dom.exportSvgBtn.addEventListener("click", () => {
      dom.statusBar.textContent = "Exporting SVG...";
      setTimeout(() => {
        exportSVG();
        dom.statusBar.textContent = "SVG exported!";
      }, 10);
    });

    dom.animateBtn.addEventListener("click", () => {
      if (animationState.playing) {
        stopAnimation();
      } else {
        startAnimation();
      }
    });

    // Checkpoint controls
    document
      .getElementById("save-checkpoint-btn")
      .addEventListener("click", saveCheckpoint);
    updateCheckpointUI();

    // Animation mode controls
    document.querySelectorAll('input[name="anim-mode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const mode = e.target.value;
        document.getElementById("sequence-controls").style.display =
          mode === "sequence" ? "block" : "none";
      });
    });

    // Phase animation controls
    document.querySelectorAll(".phase-enable").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const param = e.target.dataset.param;
        const enabled = e.target.checked;
        animationState.phaseAnimations[param].enabled = enabled;

        // Enable/disable speed slider and direction button
        const row = e.target.closest(".phase-param-row");
        row.querySelector(".phase-speed").disabled = !enabled;
        row.querySelector(".phase-direction").disabled = !enabled;
      });
    });

    document.querySelectorAll(".phase-speed").forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const param = e.target.dataset.param;
        const speed = parseFloat(e.target.value);
        animationState.phaseAnimations[param].speed = speed;

        // Update speed display
        const row = e.target.closest(".phase-param-row");
        row.querySelector(".phase-speed-val").textContent =
          speed.toFixed(1) + "×";
      });
    });

    document.querySelectorAll(".phase-direction").forEach((button) => {
      button.addEventListener("click", (e) => {
        const param = e.target.dataset.param;
        const currentDirection =
          animationState.phaseAnimations[param].direction;
        const newDirection = currentDirection * -1;
        animationState.phaseAnimations[param].direction = newDirection;

        // Update button display
        e.target.textContent = newDirection > 0 ? "→" : "←";
        e.target.dataset.direction = newDirection;

        // Update button style
        if (newDirection < 0) {
          e.target.style.background = "#2a1a1a";
        } else {
          e.target.style.background = "";
        }
      });
    });

    // Sequence animation controls
    document.getElementById("sequence-loop").addEventListener("change", (e) => {
      animationState.sequenceLoop = e.target.checked;
    });

    // Setup tabs
    setupTabs();
    updateClearButtonText();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup smart visibility toggle
    dom.showAllParams.addEventListener("change", () => {
      updateParameterVisibility();
    });

    LANDMARKS.forEach((landmark, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = landmark.name;
      dom.templateSelect.appendChild(option);
    });

    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select a Landmark...";
    dom.templateSelect.prepend(defaultOption);
    dom.templateSelect.selectedIndex = 0;

    dom.templateSelect.addEventListener("change", (e) => {
      const index = e.target.value;
      if (index !== "" && LANDMARKS[index]) {
        pushToHistory();
        const landmark = LANDMARKS[index];
        paramState = getDefaultState();
        Object.keys(landmark).forEach((key) => {
          if (paramState.hasOwnProperty(key)) {
            paramState[key] = landmark[key];
          }
        });
        updateAllControls();
        redraw();
      }
    });

    historyStack = [];
    dom.undoBtn.disabled = true;
  }

  initialize();
});