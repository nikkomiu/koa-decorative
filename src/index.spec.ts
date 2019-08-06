import * as index from './index';

describe('index.ts', () => {
  it('exports functions', () => {
    // Arrange
    const expectedExports = [
      '__esModule', 'defaultRouteManager', 'buildRoutes',
      'Pre', 'Route', 'Controller',
      'All', 'Head', 'Get', 'Post', 'Put', 'Patch', 'Delete', 'Options',
      'default',
    ];

    // Assert
    expect(Object.getOwnPropertyNames(index)).toEqual(expectedExports);
  });
});
