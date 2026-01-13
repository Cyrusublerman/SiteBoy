// Test setup for SiteBoy Framework
// Polyfills and global mocks for testing environment

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// Mock performance.now
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Setup global test utilities
global.testUtils = {
  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Wait for specific time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create mock element
  createMockElement: (tagName = 'div') => {
    const element = document.createElement(tagName);
    element.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100
    }));
    return element;
  }
};

console.log('✅ Test environment setup complete');