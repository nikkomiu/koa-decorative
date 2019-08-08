import * as index from './index';

describe('index.ts', () => {
  it('exports functions', () => {
    // Arrange
    const expectedExports = [
      '__esModule', 'defaultRouteManager', 'buildRoutes',
      'Pre', 'Route', 'Controller',
      'All', 'Get', 'Post', 'Put', 'Patch', 'Delete',
      'default',
    ];

    // Assert
    expect(Object.getOwnPropertyNames(index)).toEqual(expectedExports);
  });
});
