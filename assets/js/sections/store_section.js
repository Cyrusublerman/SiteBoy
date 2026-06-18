/**
 * Store Section - SiteBoy Framework
 *
 * Product browse, cart (localStorage), Stripe test-mode checkout stub.
 * See blog/docs/site/store-spec.md.
 *
 * @version 1.0.0
 * @dependencies ['ComponentLibrary']
 */

const StoreSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    cartKey: 'siteboy:store:cart',

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
            this.renderIndex();
        } else if (subsection === 'cart') {
            this.renderCart();
        } else if (subsection === 'checkout') {
            this.renderCheckout();
        } else if (subsection.startsWith('receipt/')) {
            this.renderReceipt(subsection.split('/')[1]);
        } else {
            this.renderProduct(subsection);
        }
    },

    renderIndex() {
        this._prepareContainer('store-section-index');
        const deps = this._deps();
        const tracked = this._track();

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({ level: 1, content: 'STORE' }, deps)).render());

        const items = this.STUB_PRODUCTS.filter((p) => p.active);
        items.forEach((product) => {
            const line = tracked(new ComponentLibrary.Paragraph({
                content: `${product.title} — ${this.formatPrice(product)}`,
                isClickable: true,
                onClick: () => this._navigate(product.sku)
            }, deps));
            const lineEl = line.render();
            lineEl.classList.add('store-product-row');
            this.currentContainer.appendChild(lineEl);
        });

        this._appendCartLink(deps, tracked);
    },

    renderProduct(sku) {
        const product = this.STUB_PRODUCTS.find((p) => p.sku === sku);
        if (!product) {
            this.renderError(`Unknown product: ${sku}`);
            return;
        }

        this._prepareContainer('store-section-detail');
        const deps = this._deps();
        const tracked = this._track();

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({ level: 1, content: product.title }, deps)).render());
        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({ content: product.description || '' }, deps)).render());
        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({ content: this.formatPrice(product) }, deps)).render());

        const addBtn = tracked(new ComponentLibrary.Button({
            text: 'ADD TO CART',
            onClick: () => {
                this.addToCart(product.sku, 1);
                window.debugLog('TOOLS', `🛒 Added ${product.sku} to cart`);
            }
        }, deps));
        this.currentContainer.appendChild(addBtn.render());

        this._appendCartLink(deps, tracked);
    },

    renderCart() {
        this._prepareContainer('store-section-cart');
        const deps = this._deps();
        const tracked = this._track();
        const cart = this.getCart();

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({ level: 1, content: 'CART' }, deps)).render());

        if (!cart.length) {
            this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({ content: 'Cart is empty.' }, deps)).render());
            this._appendStoreLink(deps, tracked);
            return;
        }

        let total = 0;
        cart.forEach((line) => {
            const product = this.STUB_PRODUCTS.find((p) => p.sku === line.sku);
            if (!product) return;
            const lineTotal = product.price_cents * line.qty;
            total += lineTotal;
            this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
                content: `${product.title} × ${line.qty} — ${this.formatCents(lineTotal, product.currency)}`
            }, deps)).render());
        });

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
            content: `SUBTOTAL — ${this.formatCents(total, 'aud')}`
        }, deps)).render());

        const checkoutBtn = tracked(new ComponentLibrary.Button({
            text: 'CHECKOUT',
            onClick: () => this._navigate('checkout')
        }, deps));
        this.currentContainer.appendChild(checkoutBtn.render());
    },

    renderCheckout() {
        this._prepareContainer('store-section-checkout');
        const deps = this._deps();
        const tracked = this._track();

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({ level: 1, content: 'CHECKOUT' }, deps)).render());
        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
            content: 'Stripe test-mode stub. Backend session endpoint pending A1/A3.'
        }, deps)).render());

        const emailInput = tracked(new ComponentLibrary.TextInput({
            label: 'EMAIL',
            placeholder: 'you@example.com',
            key: 'checkoutEmail'
        }, deps));
        this.currentContainer.appendChild(emailInput.render());

        const payBtn = tracked(new ComponentLibrary.Button({
            text: 'PAY (TEST MODE)',
            onClick: () => this.runCheckoutStub(emailInput.getValue?.() || '')
        }, deps));
        this.currentContainer.appendChild(payBtn.render());
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

    renderReceipt(orderId) {
        this._prepareContainer('store-section-receipt');
        const deps = this._deps();
        const tracked = this._track();

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({ level: 1, content: 'ORDER RECEIVED' }, deps)).render());
        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
            content: `Test order ${orderId}. No charge applied.`
        }, deps)).render());
        this._appendStoreLink(deps, tracked);
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

    _appendCartLink(deps, tracked) {
        const cart = tracked(new ComponentLibrary.Paragraph({
            content: `CART (${this.getCart().reduce((n, l) => n + l.qty, 0)})`,
            isClickable: true,
            onClick: () => this._navigate('cart')
        }, deps));
        const cartEl = cart.render();
        cartEl.classList.add('store-cart-link');
        this.currentContainer.appendChild(cartEl);
    },

    _appendStoreLink(deps, tracked) {
        const back = tracked(new ComponentLibrary.Paragraph({
            content: '← BACK TO STORE',
            isClickable: true,
            onClick: () => this._navigate(null)
        }, deps));
        this.currentContainer.appendChild(back.render());
    },

    _prepareContainer(className) {
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('store-section', className, 'toc-container');
    },

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _track() {
        return (component) => {
            this.componentInstances.push(component);
            return component;
        };
    },

    renderError(message) {
        this.currentContainer.innerHTML = '';
        const para = new ComponentLibrary.Paragraph({ content: `⚠ ${message}` }, this._deps());
        this.componentInstances.push(para);
        this.currentContainer.appendChild(para.render());
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up Store Section...');
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            this.currentContainer.classList.remove('store-section', 'store-section-index', 'store-section-detail', 'store-section-cart', 'store-section-checkout', 'store-section-receipt', 'toc-container');
        }
        if (this.componentInstances.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.componentInstances);
        }
        this.componentInstances = [];
    }
};

window.StoreSection = StoreSection;
window.debugLog('INIT', `🛒 StoreSection v${StoreSection.version} loaded`);
