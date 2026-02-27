const config = require('../config');

describe('Config Module', () => {
  test('should load development config', () => {
    process.env.NODE_ENV = 'development';
    expect(config.isDevelopment()).toBe(true);
    expect(config.isTest()).toBe(false);
    expect(config.isProduction()).toBe(false);
  });

  test('should load test config', () => {
    process.env.NODE_ENV = 'test';
    expect(config.isTest()).toBe(true);
  });

  test('should load production config', () => {
    process.env.NODE_ENV = 'production';
    expect(config.isProduction()).toBe(true);
  });
});
