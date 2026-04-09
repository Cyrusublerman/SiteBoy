/**
 * QR hub section — hash-only landing (#qr) for outbound / in-site links.
 * Not linked from primary navigation; share URL or QR only.
 *
 * @version 3.0.0
 * @dependencies ['ComponentLibrary', 'MathematicalFoundation']
 */

const BLUETHUMB_PROFILE_URL =
    'https://bluethumb.com.au/alexander-einoder-alexander-einoder';

const NAV_ITEMS = [
    { label: 'GALLERY', action: 'art'      },
    { label: 'STORE',   action: 'external' },
];

const QrHubSection = {
    version: '3.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,

    handleRoute(subsection, container, callbacks = {}) {
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        if (window.Subheader) window.Subheader.hide();
        this.renderHub();
    },

    renderHub() {
        const MF = window.MathematicalFoundation;
        const F  = MF ? MF.F : 14;
        const deps = { MF, Resize: window.ResizeManager };

        this.currentContainer.innerHTML = '';

        // Outer shell fills the content container and centres the column
        const shell = new ComponentLibrary.BaseComponent({ componentType: 'qr-hub' }, deps);
        this.componentInstances.push(shell);
        const root = shell.render();
        shell.applyStyles(root, {
            width:          '100%',
            height:         '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
        });

        // Inner column — fixed width, all-four-sides border owns the outer rectangle
        const colComp = new ComponentLibrary.BaseComponent({ componentType: 'qr-col' }, deps);
        this.componentInstances.push(colComp);
        const col = colComp.render();
        colComp.applyStyles(col, {
            width:  `${F * 28}px`,
            border: '1px solid var(--c-border)',
        });

        // Nav rows — container owns outer edges, STORE owns the internal divider
        NAV_ITEMS.forEach((item, i) => {
            const onClick = item.action === 'external'
                ? () => window.open(BLUETHUMB_PROFILE_URL, '_blank', 'noopener,noreferrer')
                : () => this.navigateTo(item.action);

            const btn = new ComponentLibrary.Button({ text: item.label, onClick }, deps);
            this.componentInstances.push(btn);
            const el = btn.render();

            btn.applyStyles(el, {
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                width:         '100%',
                height:        `${F * 2}px`,
                padding:       `0 ${F}px`,
                boxSizing:     'border-box',
                background:    'var(--c-bg)',
                color:         'var(--c-text)',
                border:        'none',
                borderTop:     i === 0 ? 'none' : '1px solid var(--c-border)',
                fontFamily:    "'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace",
                fontSize:      `${F}px`,
                textTransform: 'uppercase',
                textAlign:     'center',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
            });

            // Hover — inversion per design-law §6.3
            el.addEventListener('mouseenter', () => {
                el.style.background = 'var(--c-text)';
                el.style.color      = 'var(--c-bg)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.background = 'var(--c-bg)';
                el.style.color      = 'var(--c-text)';
            });

            col.appendChild(el);
        });

        root.appendChild(col);
        this.currentContainer.appendChild(root);
    },

    navigateTo(section) {
        const nav = this.navigationCallbacks?.navigateToSection;
        if (nav) nav(section);
        else window.location.hash = `#${section}`;
    },

    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
        }
        ComponentLibrary.destroyTracked(this.componentInstances);
        this.componentInstances = [];
    },
};

window.QrHubSection = QrHubSection;
window.debugLog('INIT', `QrHub Section v${QrHubSection.version} ready`);
