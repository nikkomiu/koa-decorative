import koaTreeRouter from 'koa-tree-router';

import RouteManager, { IManagedRoute, RouteVerb } from './RouteManager';

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

    routeManager = new RouteManager({ router });
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
    routeManager.buildRoutes();

    // Assert
    expect((routeManager as any).isBuilt).toBe(true);
    expect(router.get).toHaveBeenCalled();
    expect(router.post).toHaveBeenCalled();
  });

  it('does not rebuild the routes if build is called multiple times', () => {
    // Arrange
    routeManager.registerRoutes(routesToAdd);
    routeManager.buildRoutes();

    // Act
    routeManager.buildRoutes();

    // Assert
    expect(router.get).toHaveBeenCalledTimes(1);
    expect(router.post).toHaveBeenCalledTimes(1);
  });
});

describe('RouteManager decorators', () => {
  const buildController = (routeManager: RouteManager) => (verb: RouteVerb, path?: string, prefix?: string, preHandler?: any) => {
    const d = routeManager[verb];

    @routeManager.controller(prefix)
    // @ts-ignore
    class Test {
      @d(path)
      // @ts-ignore
      list() { }

      @d(path)
      @routeManager.pre(preHandler)
      // @ts-ignore
      preDid() {}
    }

    return Test;
  }

  let routeManager: RouteManager;
  let readyController: (verb: RouteVerb, path?: string, prefix?: string, preHandler?: any) => any;

  beforeEach(() => {
    routeManager = new RouteManager();

    readyController = buildController(routeManager);
  });

  it('can attach a pre handler to a request', () => {
    // Arrange
    const expectedVerb = 'get';
    const expectedPath = '/test';
    const preHandlers = () => {};
    const ctrl = readyController(expectedVerb, expectedPath, undefined, preHandlers);

    // Act
    new ctrl();

    // Assert
    const { verb, path, handlers } = (routeManager as any).routes[1];
    expect(verb).toEqual(expectedVerb);
    expect(path).toEqual(expectedPath);
    expect(handlers.length).toEqual(2);
    expect(handlers[0]).toBe(preHandlers);
  });

  it('can attach multiple pre handlers to a request', () => {
    // Arrange
    const expectedVerb = 'get';
    const expectedPath = '/test';
    const preHandlers = [() => {}, () => {}];
    const ctrl = readyController(expectedVerb, expectedPath, undefined, preHandlers);

    // Act
    new ctrl();

    // Assert
    const { verb, path, handlers } = (routeManager as any).routes[1];
    expect(verb).toEqual(expectedVerb);
    expect(path).toEqual(expectedPath);
    expect(handlers.length).toEqual(3);
    expect(handlers[0]).toBe(preHandlers[0]);
    expect(handlers[1]).toBe(preHandlers[1]);
  });

  [
    { verb: 'head', expectedPath: '/' },
    { verb: 'head', path: '/test' },
    { verb: 'get', expectedPath: '/' },
    { verb: 'get', path: '/test' },
    { verb: 'post', path: '/test' },
    { verb: 'put', path: '/test' },
    { verb: 'patch', path: '/test' },
    { verb: 'delete', path: '/test' },
    { verb: 'all', path: 'test', prefix: 'some', expectedPath: '/some/test' },
    { verb: 'options', path: '/test/', prefix: '/some/', expectedPath: '/some/test' },
  ].forEach(test => it(`creates ${test.verb} route for path "${test.path}" controller with ${test.prefix || 'no'} prefix`, () => {
    // Arrange
    const ctrl = readyController(test.verb as any, test.path, test.prefix);

    // Act
    new ctrl();

    // Assert
    const { verb, path, handlers } = (routeManager as any).routes[0];
    expect(verb).toEqual(test.verb);
    expect(path).toEqual(test.expectedPath || test.path);
    expect(handlers.length).toEqual(1);
  }));
});
