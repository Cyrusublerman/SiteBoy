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
        console.log('🔍 LaTeX Diagnostic Report');
        console.log('========================');
        
        // Check MathJax availability
        const mathJaxStatus = this.checkMathJax();
        console.log(`📚 MathJax Status: ${mathJaxStatus ? '✅ Available' : '❌ Not Available'}`);
        
        if (mathJaxStatus) {
            console.log(`   Version: ${window.MathJax?.version || 'Unknown'}`);
            console.log(`   TypesetPromise available: ${!!window.MathJax?.typesetPromise}`);
        }
        
        // Check for LaTeX content
        const latexContent = this.findLaTeXContent();
        console.log(`🧮 LaTeX Content Found: ${latexContent.total} instances`);
        console.log(`   Display Math ($$): ${latexContent.displayMath}`);
        console.log(`   Inline Math ($): ${latexContent.inlineMath}`);
        console.log(`   LaTeX Commands (\\): ${latexContent.commands}`);
        
        // Check rendered math elements
        const renderedMath = this.checkRenderedMath();
        console.log(`🎨 Rendered Math Elements: ${renderedMath.total}`);
        console.log(`   With SiteBoy styling: ${renderedMath.withStyling}`);
        console.log(`   Display math: ${renderedMath.display}`);
        console.log(`   Inline math: ${renderedMath.inline}`);
        
        // Check CSS variables
        const cssStatus = this.checkCSSVariables();
        console.log(`🎨 CSS Variables:`);
        console.log(`   --f: ${cssStatus.f}`);
        console.log(`   Math font size: ${cssStatus.mathFontSize}`);
        
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
            console.log('🔄 Force re-rendering all math...');
            
            // Clear existing math
            const mathElements = document.querySelectorAll('mjx-container');
            mathElements.forEach(el => el.remove());
            
            // Re-render with MathJax
            await window.MathJax.typesetPromise();
            
            console.log('✅ Math re-rendering complete');
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
            console.log('🧪 Testing LaTeX rendering...');
            await window.MathJax.typesetPromise([testContainer]);
            console.log('✅ Test rendering successful');
            
            // Check results
            const renderedMath = testContainer.querySelectorAll('mjx-container');
            console.log(`📊 Rendered ${renderedMath.length} math elements in test`);
            
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

console.log('🔍 LaTeX Diagnostic tools loaded (MathJax) - Try: LaTeXDiagnostic.runDiagnostic()');
