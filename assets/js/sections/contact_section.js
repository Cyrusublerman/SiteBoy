/**
 * Contact Section - SiteBoy Framework
 * 
 * CONTACT SECTION HANDLER - Simple contact form
 * Minimal, efficient contact form using ComponentLibrary
 * 
 * @version 1.0.0 - Initial Implementation
 * @dependencies ['ComponentLibrary'] - Component system
 */

const ContactSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    /**
     * Handle route changes for contact section
     * @param {string|null} subsection - Subsection path (should be null for contact)
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks = {}) {
        console.log(`📧 Contact Section v${this.version} handling route: ${subsection || 'main'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Hide subheader for contact page
        if (window.Subheader) {
            window.Subheader.hide();
            console.log('✅ Hidden subheader for contact page');
        }
        
        this.renderContactPage();
    },
    
    /**
     * Render contact form following ColorQuantizer layout pattern
     */
    renderContactPage() {
        console.log('📧 Rendering contact page...');
        
        const F = window.MathematicalFoundation?.F || 12;
        
        // Clear container
        this.currentContainer.innerHTML = '';
        
        // Single column container with fixed width, centered
        const controls = document.createElement('div');
        controls.className = 'contact-controls';
        controls.style.cssText = `
            width: ${F*36}px;
            margin: 0 auto;
        `;
        
        this.currentContainer.appendChild(controls);
        
        // Create all the control sections
        this.createFormSections(controls, F);
        
        console.log('✅ Contact page rendered');
    },
    
    /**
     * Create form sections - Formspree integration
     */
    createFormSections(controls, F) {
        // Create form wrapper
        const formWrapper = new window.ComponentLibrary.BaseComponent({}, { MF: window.MathematicalFoundation });
        this.componentInstances.push(formWrapper);
        
        const form = formWrapper.createElement('form');
        form.action = 'https://formspree.io/f/mqaywglp';
        form.method = 'POST';
        form.style.cssText = `
            margin: 0;
            padding: 0;
        `;
        
        // Name input - Height: F*2
        const nameInput = new window.ComponentLibrary.Input({
            type: 'text',
            name: 'name',
            placeholder: 'NAME'
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(nameInput);
        
        const nameEl = nameInput.render();
        nameEl.required = true;
        nameEl.style.cssText = `
            width: 100%;
            height: ${F*2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            padding: 0 ${F}px;
            box-sizing: border-box;
            display: block;
            margin: 0;
        `;
        form.appendChild(nameEl);
        
        // Email input - Height: F*2, shared top border
        const emailInput = new window.ComponentLibrary.Input({
            type: 'email',
            name: 'email',
            placeholder: 'EMAIL'
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(emailInput);
        
        const emailEl = emailInput.render();
        emailEl.required = true;
        emailEl.style.cssText = `
            width: 100%;
            height: ${F*2}px;
            border: 1px solid var(--c-border);
            border-top: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            padding: 0 ${F}px;
            box-sizing: border-box;
            display: block;
            margin: 0;
        `;
        form.appendChild(emailEl);
        
        // Message textarea
        const messageWrapper = new window.ComponentLibrary.BaseComponent({}, { MF: window.MathematicalFoundation });
        this.componentInstances.push(messageWrapper);
        
        const messageEl = messageWrapper.createElement('textarea', 'input component');
        messageEl.name = 'message';
        messageEl.placeholder = 'MESSAGE';
        messageEl.required = true;
        messageEl.style.cssText = `
            width: 100%;
            height: ${F*12}px;
            border: 1px solid var(--c-border);
            border-top: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            line-height: ${F}px;
            padding: ${Math.floor(F/2)}px ${F}px;
            box-sizing: border-box;
            resize: vertical;
            display: block;
            margin: 0;
        `;
        form.appendChild(messageEl);
        
        // Send button - exact header button styling as submit button
        const sendBtnWrapper = new window.ComponentLibrary.BaseComponent({}, { MF: window.MathematicalFoundation });
        this.componentInstances.push(sendBtnWrapper);
        
        const sendBtn = sendBtnWrapper.createElement('button', 'clickable');
        sendBtn.type = 'submit';
        sendBtn.textContent = 'SEND';
        sendBtn.style.cssText = `
            width: 100%;
            height: ${F*2}px;
            border: 1px solid var(--c-border);
            border-top: none;
            padding: 0 ${F}px;
            display: flex;
            align-items: center;
            font-size: ${F}px;
            cursor: pointer;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin: 0;
            background: var(--c-bg);
            color: var(--c-text);
        `;
        form.appendChild(sendBtn);
        
        controls.appendChild(form);
    },
    
    /**
     * Cleanup section resources
     */
    cleanup() {
        console.log('🧹 Cleaning up Contact Section...');
        
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
        }
        
        if (this.componentInstances.length > 0 && window.ComponentLibrary) {
            window.ComponentLibrary.destroyTracked(this.componentInstances);
        }
        
        console.log('✅ Contact Section cleanup completed');
    }
};

// Global registration for router access
window.ContactSection = ContactSection;

console.log(`📧 ContactSection v${ContactSection.version} loaded`);

