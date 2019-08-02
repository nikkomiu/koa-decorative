import koaTreeRouter from 'koa-tree-router';

import RouteManager, { IManagedRoute } from './RouteManager';

describe('RouteManager init', () => {
  it('can be constructed without params', () => {
    // Act
    const routeManager = new RouteManager();

    // Assert
    const internalManager = routeManager as any;
    expect(routeManager.router).toBeDefined();
    expect(internalManager.isBuilt).toEqual(false);
    expect(internalManager.routes).toEqual([]);
  });

  it('can be constructed with a custom router', () => {
    // Arrange
    const routerObj = new koaTreeRouter();

    // Act
    const routeManager = new RouteManager({ router: routerObj });

    // Assert
    expect(routeManager.router).toBe(routerObj);
  });
});

describe('RouteManager instance', () => {
  let router: koaTreeRouter;
  let routeManager: RouteManager;
  const routesToAdd: IManagedRoute[] = [
    { verb: 'get', path: '/test', handlers: [() => null] },
    { verb: 'post', path: '/test', handlers: [() => null] },
  ];

  beforeEach(() => {
    router = new koaTreeRouter();

    jest.spyOn(router, 'get');
    jest.spyOn(router, 'post');

    routeManager = new RouteManager();
  });

  it('can register routes', () => {
    // Act
    routeManager.registerRoutes(routesToAdd);

    // Assert
    expect((routeManager as any).routes).toEqual(routesToAdd);
  });

  it('can build the routes', () => {
    // Arrange
    routeManager.registerRoutes(routesToAdd);

    // Act
    routeManager.build();

    // Assert
    expect((routeManager as any).isBuilt).toBe(true);
    expect(router.get).toHaveBeenCalled();
    expect(router.post).toHaveBeenCalled();
  });

  it('does not rebuild the routes if build is called multiple times', () => {
    // Arrange
    routeManager.registerRoutes(routesToAdd);
    routeManager.build();

    // Act
    routeManager.build();

    // Assert
    expect(router.get).toHaveBeenCalledTimes(1);
    expect(router.post).toHaveBeenCalledTimes(1);
  });
});
