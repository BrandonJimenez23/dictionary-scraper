// Jest setup file
console.log('🧪 Setting up Jest testing environment...');

// Global test configuration
global.console = {
  ...console,
  // Uncomment to reduce console output during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
