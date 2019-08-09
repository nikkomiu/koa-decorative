import 'reflect-metadata';
import { Middleware } from 'koa';

import { IRouteManagerOpts, IRouter, IManagedRoute, RouteVerb } from './types';

const controllerRoutingKey = Symbol('controllerRoutingKey');
const preHandlersKey = Symbol('preHandlersKey');

export const noUsableRouterError = new Error('no usable router found');

const stripPostfix = (str: string, postfix: string) => str.endsWith(postfix)
  ? str.substr(0, str.length - postfix.length)
  : str;

const stripPrefix = (str: string, prefix: string) => str.startsWith(prefix)
  ? str.substr(prefix.length, str.length)
  : str;

/* tslint:disable:variable-name */
export const Pre = (handler: Middleware | Middleware[]): MethodDecorator => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
  const addtlHandlers = Array.isArray(handler) ? handler : [handler];

  Reflect.defineMetadata(
    preHandlersKey,
    [...Reflect.getMetadata(preHandlersKey, target) || [], ...addtlHandlers],
    target[key]);
};

export class RouteManager {
  private isBuilt: boolean = false;
  public router: IRouter;
  private routes: IManagedRoute[] = [];

  constructor(opts?: IRouteManagerOpts) {
    const { router } = opts || {} as IRouteManagerOpts;

    if (router) {
      this.router = router;
    } else {
      try {
        const pkg = process.env.npm_package_config_koa_decorative_default_router || 'koa-tree-router';
        const router = require(pkg);
        this.router = new router();
      } catch {
        throw noUsableRouterError;
      }
    }
  }

  registerRoutes(routes: IManagedRoute[]) {
    this.routes.push(...routes);
  }

  buildRoutes() {
    if (!this.isBuilt) {
      this.routes.forEach(({ verb, path, handlers }) => this.router[verb](path, ...handlers));
      this.isBuilt = true;
    }

    return this.router.routes();
  }

  controller = (routePrefix?: string): ClassDecorator => <TFunction extends Function>(target: TFunction) => {
    let prefix = stripPrefix(stripPostfix(routePrefix || '', '/'), '/').toLowerCase();
    if (prefix.length) { prefix = `/${prefix}`; }

    const original = target;

    const construct = (constructor: TFunction, args: any) => {
      const ctrl: any = function (this: TFunction) {
        return constructor.apply(this, args);
      };
      ctrl.prototype = constructor.prototype;
      const ic = new ctrl();

      const buildRoutes = (target: Object): IManagedRoute[] => (Reflect.getMetadata(controllerRoutingKey, target) || []).map((route: IManagedRoute) => {
        const path = stripPostfix(route.path.startsWith('/') ? `${prefix}${route.path}` : `${prefix}/${route.path}`, '/');

        // TODO: Add option to bind pre handlers to bind context
        const handlers = route.handlers.map((h, i, a) => (i === a.length - 1) ? h.bind(ic) : h);

        return { handlers, verb: route.verb, path: path || '/' };
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

  route = (verb: RouteVerb, path?: string) => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const preHandlers = Reflect.getMetadata(preHandlersKey, target[key]) || [];
    const currentHandlers = Reflect.getMetadata(controllerRoutingKey, target) || [];

    Reflect.defineMetadata(
      controllerRoutingKey,
      [...currentHandlers, { verb, path: path || '/', handlers: [...preHandlers, descriptor.value] }] as IManagedRoute[],
      target);
  }

  all = (path?: string) => this.route('all', path);
  get = (path?: string) => this.route('get', path);
  post = (path?: string) => this.route('post', path);
  put = (path?: string) => this.route('put', path);
  patch = (path?: string) => this.route('patch', path);
  delete = (path?: string) => this.route('delete', path);
}
