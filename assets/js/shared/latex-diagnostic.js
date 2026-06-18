/**
 * LaTeX Diagnostic Utility - SiteBoy Framework
 * 
 * Tools for diagnosing and fixing LaTeX rendering issues
 * 
 * @version 1.0.0 - LaTeX Debugging Support
 */

export const LaTeXDiagnostic = {
    
    /**
     * Run comprehensive LaTeX diagnostic
     */
    runDiagnostic() {
        window.debugLog('INIT', '🔍 LaTeX Diagnostic Report');
        window.debugLog('INIT', '========================');
        
        // Check MathJax availability
        const mathJaxStatus = this.checkMathJax();
        window.debugLog('INIT', `📚 MathJax Status: ${mathJaxStatus ? '✅ Available' : '❌ Not Available'}`);
        
        if (mathJaxStatus) {
            window.debugLog('INIT', `   Version: ${window.MathJax?.version || 'Unknown'}`);
            window.debugLog('INIT', `   TypesetPromise available: ${!!window.MathJax?.typesetPromise}`);
        }
        
        // Check for LaTeX content
        const latexContent = this.findLaTeXContent();
        window.debugLog('INIT', `🧮 LaTeX Content Found: ${latexContent.total} instances`);
        window.debugLog('INIT', `   Display Math ($$): ${latexContent.displayMath}`);
        window.debugLog('INIT', `   Inline Math ($): ${latexContent.inlineMath}`);
        window.debugLog('INIT', `   LaTeX Commands (\\): ${latexContent.commands}`);
        
        // Check rendered math elements
        const renderedMath = this.checkRenderedMath();
        window.debugLog('INIT', `🎨 Rendered Math Elements: ${renderedMath.total}`);
        window.debugLog('INIT', `   With SiteBoy styling: ${renderedMath.withStyling}`);
        window.debugLog('INIT', `   Display math: ${renderedMath.display}`);
        window.debugLog('INIT', `   Inline math: ${renderedMath.inline}`);
        
        // Check CSS variables
        const cssStatus = this.checkCSSVariables();
        window.debugLog('INIT', `🎨 CSS Variables:`);
        window.debugLog('INIT', `   --f: ${cssStatus.f}`);
        window.debugLog('INIT', `   Math font size: ${cssStatus.mathFontSize}`);
        
        return {
            mathJaxStatus,
            latexContent,
            renderedMath,
            cssStatus
        };
    },
    
    /**
     * Check if MathJax is available and functioning
     */
    checkMathJax() {
        return !!(window.MathJax && window.MathJax.typesetPromise);
    },
    
    /**
     * Find all LaTeX content on the page
     */
    findLaTeXContent() {
        const text = document.body.textContent || '';
        
        // Count different types of math
        const displayMath = (text.match(/\$\$[\s\S]*?\$\$/g) || []).length;
        const inlineMath = (text.match(/\$[^$\n]+\$/g) || []).length;
        const commands = (text.match(/\\[a-zA-Z]+/g) || []).length;
        
        return {
            total: displayMath + inlineMath + commands,
            displayMath,
            inlineMath,
            commands
        };
    },
    
    /**
     * Check rendered math elements (MathJax)
     */
    checkRenderedMath() {
        const mathElements = document.querySelectorAll('mjx-container');
        const total = mathElements.length;
        
        let withStyling = 0;
        let display = 0;
        let inline = 0;
        
        mathElements.forEach(element => {
            const computedStyle = getComputedStyle(element);
            if (computedStyle.fontFamily.includes('Atkinson')) {
                withStyling++;
            }
            
            if (element.getAttribute('display') === 'true') {
                display++;
            } else {
                inline++;
            }
        });
        
        return {
            total,
            withStyling,
            display,
            inline
        };
    },
    
    /**
     * Check CSS variable status
     */
    checkCSSVariables() {
        const styles = getComputedStyle(document.documentElement);
        const f = styles.getPropertyValue('--f').trim();
        
        // Try to get math font size from a sample math element
        let mathFontSize = 'Not rendered';
        const mathElement = document.querySelector('mjx-container');
        if (mathElement) {
            mathFontSize = getComputedStyle(mathElement).fontSize;
        }
        
        return {
            f,
            mathFontSize
        };
    },
    
    /**
     * Force re-render all math on the page (MathJax)
     */
    async forceRerenderMath() {
        if (!this.checkMathJax()) {
            console.error('❌ MathJax not available');
            return false;
        }
        
        try {
            window.debugLog('INIT', '🔄 Force re-rendering all math...');
            
            // Clear existing math
            const mathElements = document.querySelectorAll('mjx-container');
            mathElements.forEach(el => el.remove());
            
            // Re-render with MathJax
            await window.MathJax.typesetPromise();
            
            window.debugLog('INIT', '✅ Math re-rendering complete');
            return true;
            
        } catch (error) {
            console.error('❌ Math re-rendering failed:', error);
            return false;
        }
    },
    
    /**
     * Test LaTeX rendering with a sample equation (MathJax)
     */
    async testLaTeXRendering() {
        if (!this.checkMathJax()) {
            console.error('❌ MathJax not available');
            return;
        }
        
        // Create test container
        const testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <p>Inline math test: $x = y + z$</p>
            <p>Display math test:</p>
            $$f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx$$
        `;
        
        document.body.appendChild(testContainer);
        
        try {
            window.debugLog('INIT', '🧪 Testing LaTeX rendering...');
            await window.MathJax.typesetPromise([testContainer]);
            window.debugLog('INIT', '✅ Test rendering successful');
            
            // Check results
            const renderedMath = testContainer.querySelectorAll('mjx-container');
            window.debugLog('INIT', `📊 Rendered ${renderedMath.length} math elements in test`);
            
        } catch (error) {
            console.error('❌ Test rendering failed:', error);
        }
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(testContainer);
        }, 5000);
    }
};

// Make available globally for console debugging
window.LaTeXDiagnostic = LaTeXDiagnostic;

window.debugLog('INIT', '🔍 LaTeX Diagnostic tools loaded (MathJax) - Try: LaTeXDiagnostic.runDiagnostic()');
