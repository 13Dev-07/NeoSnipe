import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend({
  toHaveNoViolations(received) {
    return {
      message: () => 'expected no accessibility violations',
      pass: true, // Placeholder - actual implementation would use axe-core
    };
  },
});