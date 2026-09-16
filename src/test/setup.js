import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach } from 'vitest';

// Expose React globally for JSX transform in tests
globalThis.React = React;

// Mock scrollIntoView for jsdom environment
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
});
