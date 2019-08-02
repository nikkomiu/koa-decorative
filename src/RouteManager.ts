import 'reflect-metadata';
import koaTreeRouter from 'koa-tree-router';

const controllerRoutingKey = Symbol('controllerRoutingKey');
const preHandlersKey = Symbol('preHandlersKey');

export type RouteVerb = 'all' | 'head' | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options';

export interface IManagedRoute {
  verb: RouteVerb;
  path: string;
  handlers: koaTreeRouter.Middleware[];
}

export interface IRouteManagerOpts {
  router?: koaTreeRouter;
}

const stripPostfix = (str: string, postfix: string) => str.endsWith(postfix)
  ? str.substr(0, str.length - 1)
  : str;

class RouteManager {
  private isBuilt: boolean = false;
  private router: koaTreeRouter;
  private routes: IManagedRoute[] = [];

  constructor(opts?: IRouteManagerOpts) {
    const { router } = opts || {} as IRouteManagerOpts;

    this.router = router || new koaTreeRouter();
  }

  registerRoutes(routes: IManagedRoute[]) {
    this.routes.push(...routes);
  }

  build() {
    if (!this.isBuilt) {
      this.routes.forEach(({ verb, path, handlers }) => this.router[verb](path, ...handlers));
      this.isBuilt = true;
    }

    return this.router.routes();
  }

  controller = (routePrefix?: string): ClassDecorator => <TFunction extends Function>(target: TFunction) => {
    const prefix = stripPostfix(routePrefix || '', '/').toLowerCase();

    const original = target;

    const construct = (constructor: TFunction, args: any) => {
      const ctrl: any = function (this: TFunction) {
        return constructor.apply(this, args);
      };
      ctrl.prototype = constructor.prototype;
      const ic = new ctrl();

      const buildRoutes = (target: Object): IManagedRoute[] => (Reflect.getMetadata(controllerRoutingKey, target) || []).map((route: IManagedRoute) => {
        if (!route.handlers || !route.handlers.length) { return; }
        const path = stripPostfix(route.path.startsWith('/') ? `${prefix}${route.path}` : `${prefix}/${route.path}`, '/');

        // TODO: Only bind actual handler not pre-handlers
        // TODO: Add option to bind pre handlers to bind context
        const handlers = route.handlers.map(h => h.bind(ic));

        return { path, handlers, verb: route.verb };
      });

      this.registerRoutes(buildRoutes(constructor));
      this.registerRoutes(buildRoutes(ic));

      return ic;
    };

    // Build new constructor
    const newConstructor: any = (...args: any[]) => construct(original, args);

    // Copy constructor prototype so instanceof still works
    newConstructor.prototype = original.prototype;

    // Return the new constructor
    return newConstructor;
  }

  pre = (handler: koaTreeRouter.Middleware | koaTreeRouter.Middleware[]): MethodDecorator => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const addtlHandlers = Array.isArray(handler) ? handler : [handler];

    Reflect.defineMetadata(
      preHandlersKey,
      [...Reflect.getMetadata(preHandlersKey, target) || [], ...addtlHandlers],
      target[key]);
  }

  route = (verb: RouteVerb, path: string) => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const preHandlers = Reflect.getMetadata(preHandlersKey, target[key]) || [];
    const currentHandlers = Reflect.getMetadata(controllerRoutingKey, target) || [];

    Reflect.defineMetadata(
      controllerRoutingKey,
      [...currentHandlers, { verb, path, handlers: [...preHandlers, descriptor.value] }] as IManagedRoute[],
      target);
  }

  all = (path: string) => this.route('all', path);
  head = (path: string) => this.route('head', path);
  get = (path: string) => this.route('get', path);
  post = (path: string) => this.route('post', path);
  put = (path: string) => this.route('put', path);
  patch = (path: string) => this.route('patch', path);
  delete = (path: string) => this.route('delete', path);
  options = (path: string) => this.route('options', path);
}

export default RouteManager;
