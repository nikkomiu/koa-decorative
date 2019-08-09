import * as index from './index';

describe('index.ts', () => {
  it('exports functions', () => {
    // Arrange
    const expectedExports = [
      '__esModule', 'RouteManager', 'Pre', 'noUsableRouterError', 'defaultRouteManager', 'buildRoutes',
      'Route', 'Controller',
      'All', 'Get', 'Post', 'Put', 'Patch', 'Delete',
    ];

    // Assert
    expect(Object.getOwnPropertyNames(index)).toEqual(expectedExports);
  });
});
