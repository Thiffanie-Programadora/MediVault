export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  testTimeout: 15000,
  verbose: true
};
