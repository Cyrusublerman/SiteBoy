/**
 * Store Section - SiteBoy Framework
 *
 * Product browse, cart (localStorage), Stripe test-mode checkout stub.
 * See blog/docs/site/store-spec.md.
 *
 * @version 1.1.0
 * @dependencies ['ComponentLibrary', 'BaseComponent']
 */

class StorePageView extends BaseComponent {
    constructor(mode, options = {}, deps = {}) {
        super({ componentType: 'store-page' }, deps);
        this.mode = mode;
        this.products = options.products || [];
        this.product = options.product || null;
        this.orderId = options.orderId || '';
        this.cartKey = options.cartKey || 'siteboy:store:cart';
        this.onNavigate = options.onNavigate;
        this.formatPrice = options.formatPrice;
        this.formatCents = options.formatCents;
        this.getCart = options.getCart;
        this.addToCart = options.addToCart;
        this.runCheckoutStub = options.runCheckoutStub;
        this.tracked = [];
    }

    _track(component) {
        this.tracked.push(component);
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        const classMap = {
            index: 'store-section-index',
            product: 'store-section-detail',
            cart: 'store-section-cart',
            checkout: 'store-section-checkout',
            receipt: 'store-section-receipt'
        };
        this.element = this.createElement('div', `store-section ${classMap[this.mode] || ''} toc-container`.trim());

        switch (this.mode) {
            case 'index': this._renderIndex(); break;
            case 'product': this._renderProduct(); break;
            case 'cart': this._renderCart(); break;
            case 'checkout': this._renderCheckout(); break;
            case 'receipt': this._renderReceipt(); break;
            default: break;
        }

        return this.element;
    }

    _renderIndex() {
        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({ level: 1, content: 'STORE' }, this.deps)).render());
        this.products.filter((p) => p.active).forEach((product) => {
            const line = this._track(new ComponentLibrary.Paragraph({
                content: `${product.title} — ${this.formatPrice(product)}`,
                isClickable: true,
                onClick: () => this.onNavigate?.(product.sku)
            }, this.deps));
            const lineEl = line.render();
            lineEl.classList.add('store-product-row');
            this.appendElement(this.element, lineEl);
        });
        this._appendCartLink();
    }

    _renderProduct() {
        const product = this.product;
        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({ level: 1, content: product.title }, this.deps)).render());
        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({ content: product.description || '' }, this.deps)).render());
        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({ content: this.formatPrice(product) }, this.deps)).render());
        const addBtn = this._track(new ComponentLibrary.Button({
            text: 'ADD TO CART',
            onClick: () => {
                this.addToCart?.(product.sku, 1);
                window.debugLog('TOOLS', `🛒 Added ${product.sku} to cart`);
            }
        }, this.deps));
        this.appendElement(this.element, addBtn.render());
        this._appendCartLink();
    }

    _renderCart() {
        const cart = this.getCart?.() || [];
        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({ level: 1, content: 'CART' }, this.deps)).render());

        if (!cart.length) {
            this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({ content: 'Cart is empty.' }, this.deps)).render());
            this._appendStoreLink();
            return;
        }

        let total = 0;
        cart.forEach((line) => {
            const product = this.products.find((p) => p.sku === line.sku);
            if (!product) return;
            const lineTotal = product.price_cents * line.qty;
            total += lineTotal;
            this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
                content: `${product.title} × ${line.qty} — ${this.formatCents(lineTotal, product.currency)}`
            }, this.deps)).render());
        });

        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
            content: `SUBTOTAL — ${this.formatCents(total, 'aud')}`
        }, this.deps)).render());

        const checkoutBtn = this._track(new ComponentLibrary.Button({
            text: 'CHECKOUT',
            onClick: () => this.onNavigate?.('checkout')
        }, this.deps));
        this.appendElement(this.element, checkoutBtn.render());
    }

    _renderCheckout() {
        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({ level: 1, content: 'CHECKOUT' }, this.deps)).render());
        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
            content: 'Stripe test-mode stub. Backend session endpoint pending A1/A3.'
        }, this.deps)).render());

        const emailInput = this._track(new ComponentLibrary.TextInput({
            label: 'EMAIL',
            placeholder: 'you@example.com',
            key: 'checkoutEmail'
        }, this.deps));
        this.appendElement(this.element, emailInput.render());

        const payBtn = this._track(new ComponentLibrary.Button({
            text: 'PAY (TEST MODE)',
            onClick: () => this.runCheckoutStub?.(emailInput.getValue?.() || '')
        }, this.deps));
        this.appendElement(this.element, payBtn.render());
    }

    _renderReceipt() {
        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({ level: 1, content: 'ORDER RECEIVED' }, this.deps)).render());
        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
            content: `Test order ${this.orderId}. No charge applied.`
        }, this.deps)).render());
        this._appendStoreLink();
    }

    _appendCartLink() {
        const cart = this._track(new ComponentLibrary.Paragraph({
            content: `CART (${(this.getCart?.() || []).reduce((n, l) => n + l.qty, 0)})`,
            isClickable: true,
            onClick: () => this.onNavigate?.('cart')
        }, this.deps));
        const cartEl = cart.render();
        cartEl.classList.add('store-cart-link');
        this.appendElement(this.element, cartEl);
    }

    _appendStoreLink() {
        const back = this._track(new ComponentLibrary.Paragraph({
            content: '← BACK TO STORE',
            isClickable: true,
            onClick: () => this.onNavigate?.(null)
        }, this.deps));
        this.appendElement(this.element, back.render());
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

class StoreErrorView extends BaseComponent {
    constructor(message, deps = {}) {
        super({ componentType: 'store-error' }, deps);
        this.message = message;
        this.tracked = [];
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('div', 'store-section toc-container');
        const para = new ComponentLibrary.Paragraph({ content: `⚠ ${this.message}` }, this.deps);
        this.tracked.push(para);
        this.appendElement(this.element, para.render());
        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

const StoreSection = {
    version: '1.1.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    cartKey: 'siteboy:store:cart',
    _view: null,

    STUB_PRODUCTS: [
        { sku: 'print-a3', title: 'A3 PRINT', description: 'Signed A3 generative print.', price_cents: 4500, currency: 'aud', active: true },
        { sku: 'zine-vol1', title: 'ZINE VOL.1', description: 'Process zine — first edition.', price_cents: 2200, currency: 'aud', active: true },
        { sku: 'stl-pack', title: 'STL PACK', description: 'Fabricable geometry bundle (digital).', price_cents: 1500, currency: 'aud', active: true }
    ],

    get pages() {
        const base = ['#store', '#store/cart', '#store/checkout'];
        return [...base, ...this.STUB_PRODUCTS.map((p) => `#store/${p.sku}`)];
    },

    async handleRoute(subsection, container, callbacks = {}) {
        window.debugLog('NAVIGATION', `🛒 Store Section v${this.version} handling route: ${subsection || 'index'}`);

        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        window.NavigationController.setupNavigation('store', subsection, this.pages, callbacks);

        if (!subsection) {
            this._mount('index');
        } else if (subsection === 'cart') {
            this._mount('cart');
        } else if (subsection === 'checkout') {
            this._mount('checkout');
        } else if (subsection.startsWith('receipt/')) {
            this._mount('receipt', { orderId: subsection.split('/')[1] });
        } else {
            const product = this.STUB_PRODUCTS.find((p) => p.sku === subsection);
            if (!product) {
                this._mountError(`Unknown product: ${subsection}`);
                return;
            }
            this._mount('product', { product });
        }
    },

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _viewOptions(extra = {}) {
        return {
            products: this.STUB_PRODUCTS,
            cartKey: this.cartKey,
            onNavigate: (sub) => this._navigate(sub),
            formatPrice: (p) => this.formatPrice(p),
            formatCents: (c, cur) => this.formatCents(c, cur),
            getCart: () => this.getCart(),
            addToCart: (sku, qty) => this.addToCart(sku, qty),
            runCheckoutStub: (email) => this.runCheckoutStub(email),
            ...extra
        };
    },

    _mount(mode, extra = {}) {
        this._view = new StorePageView(mode, this._viewOptions(extra), this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _mountError(message) {
        this._view = new StoreErrorView(message, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    runCheckoutStub(email) {
        const cart = this.getCart();
        const orderId = `ord_test_${Date.now()}`;
        const payload = {
            mode: 'stripe_test_stub',
            email,
            cart,
            orderId,
            publishableKey: 'pk_test_STUB',
            successUrl: `${window.location.origin}${window.location.pathname}#store/receipt/${orderId}`
        };

        window.debugLog('TOOLS', '🛒 Stripe checkout stub payload:', payload);

        this.clearCart();
        this._navigate(`receipt/${orderId}`);
    },

    getCart() {
        try {
            const raw = localStorage.getItem(this.cartKey);
            return raw ? JSON.parse(raw) : [];
        } catch (_) {
            return [];
        }
    },

    saveCart(cart) {
        localStorage.setItem(this.cartKey, JSON.stringify(cart));
    },

    addToCart(sku, qty = 1) {
        const cart = this.getCart();
        const existing = cart.find((l) => l.sku === sku);
        if (existing) {
            existing.qty = Math.min(99, existing.qty + qty);
        } else {
            cart.push({ sku, qty });
        }
        this.saveCart(cart);
    },

    clearCart() {
        localStorage.removeItem(this.cartKey);
    },

    formatPrice(product) {
        return this.formatCents(product.price_cents, product.currency);
    },

    formatCents(cents, currency = 'aud') {
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
    },

    _navigate(subsection) {
        if (this.navigationCallbacks?.navigateToSection) {
            this.navigationCallbacks.navigateToSection('store', subsection);
        } else if (window.Router) {
            window.Router.navigateToSection('store', subsection);
        }
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up Store Section...');
        if (this._view) {
            this._view.destroy();
            this._view = null;
        }
        if (this.currentContainer) {
            BaseComponent.clearSectionContainer(this.currentContainer, [
                'store-section', 'store-section-index', 'store-section-detail',
                'store-section-cart', 'store-section-checkout', 'store-section-receipt', 'toc-container'
            ]);
        }
        this.componentInstances = [];
    }
};

window.StoreSection = StoreSection;
window.debugLog('INIT', `🛒 StoreSection v${StoreSection.version} loaded`);
