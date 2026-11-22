import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Fix for esbuild invariant check when running in JSDOM environment
if (typeof TextEncoder !== 'undefined') {
  const NativeUint8Array = new TextEncoder().encode('').constructor;
  if (!(new TextEncoder().encode('') instanceof Uint8Array)) {
    globalThis.Uint8Array = NativeUint8Array;
  }
}

// 1. window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => (store[key] !== undefined ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((i) => Object.keys(store)[i] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// 3. ResizeObserver mock
globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
window.ResizeObserver = globalThis.ResizeObserver;

// 4. IntersectionObserver mock
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
window.IntersectionObserver = globalThis.IntersectionObserver;

// 5. URL.createObjectURL and URL.revokeObjectURL
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn();
}

// 6. navigator.clipboard mock
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
    configurable: true,
  });
} else {
  navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
  navigator.clipboard.readText = vi.fn().mockResolvedValue('');
}

// 7. window.scrollTo mock
window.scrollTo = vi.fn();

// 8. DOM Cleanup between tests
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});
