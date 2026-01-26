# P5.js to Video Tool - Exception Rationale

## Status: APPROVED EXCEPTION

P5ToVideoTool (`assets/js/tools/processors/p5-to-video.js`) is exempt from using AnimationExport and maintains its custom CCapture.js implementation.

## Why P5ToVideo Remains Separate

### 1. Tool Classification
**Type:** Meta-Tool (Processor), not a Generator

- **Generators** (cymatics, torus, etc.): Create patterns internally, control their own animation loops
- **P5ToVideo**: Executes external user code, has no internal animation logic

### 2. Technical Architecture Requirements

#### Iframe Sandboxing (Security)
- **Required:** Execute untrusted user P5.js code safely
- **Implementation:** Isolated iframe context prevents code injection
- **AnimationExport incompatibility:** Cannot access iframe canvas directly

#### P5.js-Specific Capture
- **CCapture.js design:** Built specifically for P5.js draw() loop hijacking
- **Integration:** Patches P5's internal frame timing
- **AnimationExport incompatibility:** Requires direct canvas access + renderFrame callback

### 3. Execution Model Differences

| Aspect | Gen Art Tools | P5ToVideo |
|--------|---------------|-----------|
| **Animation source** | Tool's onDraw() | User's P5 sketch |
| **Canvas ownership** | ToolBase canvas | P5 createCanvas() |
| **Frame control** | AnimationExport renderFrame() | CCapture hijacks P5 draw() |
| **Context** | Main page | Isolated iframe |
| **Code trust** | Trusted (framework) | Untrusted (user input) |

### 4. What IS Shared

Despite the exception, P5ToVideo shares:
- ✅ ToolBase structure (sidebar/canvas layout)
- ✅ ComponentLibrary UI components
- ✅ AssetLoader registration
- ✅ Cleanup patterns (destroy() method)
- ✅ Download utility (downloadBlob)

### 5. What CANNOT Be Shared

- ❌ AnimationExport component (requires direct canvas access)
- ❌ renderFrame callback (animation runs in iframe)
- ❌ getState/setState (no tool state, user code controls everything)
- ❌ Frame sequencing (CCapture handles this internally)

## Conclusion

P5ToVideo's custom export implementation is **architecturally justified** due to:
1. Security requirements (iframe isolation)
2. P5.js ecosystem integration (CCapture.js)
3. Execution model incompatibility (external code vs internal rendering)

This is not redundancy - it's a necessary adaptation for a fundamentally different tool type.

## Recommendation

**Keep P5ToVideo separate.** Any attempt to force AnimationExport integration would require:
- Breaking iframe security model
- Reimplementing CCapture's P5 integration
- Significant complexity with no benefit

**Future:** If more "code executor" tools are added (e.g., Processing.js, Three.js), extract iframe + CCapture pattern to shared utility, but keep separate from AnimationExport.

