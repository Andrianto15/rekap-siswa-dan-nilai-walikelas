import '@testing-library/jest-dom';

// Polyfill Web Standard APIs (Fetch, Request, Response, Headers) for Next.js server components/routes in Jest jsdom
if (typeof global.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
  global.Request = globalThis.Request;
  global.Response = globalThis.Response;
  global.Headers = globalThis.Headers;
  global.fetch = globalThis.fetch;
}

// Polyfills for browser environment
if (typeof window !== 'undefined') {
  if (typeof window.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
    window.Request = globalThis.Request;
    window.Response = globalThis.Response;
    window.Headers = globalThis.Headers;
    window.fetch = globalThis.fetch;
  }

  // Mock window.URL methods for file download tests
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = jest.fn();
  }

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
