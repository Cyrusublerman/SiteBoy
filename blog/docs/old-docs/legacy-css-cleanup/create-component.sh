#!/bin/bash

# SiteBoy Component Generator
# Usage: ./scripts/create-component.sh ComponentName category

if [ $# -ne 2 ]; then
    echo "Usage: $0 ComponentName category"
    echo "Categories: foundation, layout, content, interactive, graphs, specialized"
    exit 1
fi

COMPONENT_NAME=$1
CATEGORY=$2
COMPONENT_FILE="src/components/$CATEGORY/$COMPONENT_NAME.js"
LOWER_NAME=$(echo "$COMPONENT_NAME" | tr '[:upper:]' '[:lower:]')

# Validate category
case $CATEGORY in
    foundation|layout|content|interactive|graphs|specialized)
        ;;
    *)
        echo "❌ Invalid category: $CATEGORY"
        echo "Valid categories: foundation, layout, content, interactive, graphs, specialized"
        exit 1
        ;;
esac

# Check if component already exists
if [ -f "$COMPONENT_FILE" ]; then
    echo "❌ Component already exists: $COMPONENT_FILE"
    exit 1
fi

# Create component file
mkdir -p "src/components/$CATEGORY"

cat > "$COMPONENT_FILE" << EOF
import { BaseComponent } from '../foundation/BaseComponent.js';

/**
 * $COMPONENT_NAME - Brief description
 * 
 * @version 1.0.0
 * @category $CATEGORY
 */
export class $COMPONENT_NAME extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: '$LOWER_NAME' }, deps);
        
        // Component-specific properties
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            // Use MathematicalFoundation for calculations
            const layout = this.deps.MF?.computeLayout() || {};
            const F = this.deps.MF?.F || 12;
            
            // Create element using BaseComponent methods
            this.element = this.createElement('div', '$LOWER_NAME');
            
            // Apply F=12px mathematical foundation
            this.element.style.cssText = \`
                font-size: var(--f);
                padding: var(--f);
                background: var(--c-bg);
                color: var(--c-text);
                border: var(--outline-width) solid var(--c-border);
                font-family: 'Space Mono', monospace;
            \`;
            
            // Set content
            this.setContent(this.content);
        }
        return this.element;
    }
    
    /**
     * Update component content
     */
    setContent(content) {
        if (this.element) {
            this.element.textContent = content;
        }
        this.content = content;
    }
    
    /**
     * Component cleanup
     */
    destroy() {
        super.destroy();
        // Component-specific cleanup here
    }
}
EOF

echo "✅ Component created: $COMPONENT_FILE"

# Add CSS template
echo ""
echo "📝 Add this CSS to assets/css/styles.css:"
echo ""
cat << EOF
/* $COMPONENT_NAME Component */
.$LOWER_NAME {
    font-family: 'Space Mono', monospace;
    font-size: var(--f);
    background: var(--c-bg);
    color: var(--c-text);
    border: var(--outline-width) solid var(--c-border);
    /* Add component-specific styles here */
}

.$LOWER_NAME:hover {
    background: var(--c-border);
    color: var(--c-bg);
}
EOF

echo ""
echo "📋 Next steps:"
echo "1. Update src/index.js to import and export $COMPONENT_NAME"
echo "2. Add CSS styles to assets/css/styles.css"
echo "3. Add UI test to tools_section.js"
echo "4. Run ./scripts/rebuild-bundle.sh"
echo "5. Test at http://localhost:8000/#tools/ui-test"

