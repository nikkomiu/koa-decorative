import { Middleware } from 'koa';

export type RouteVerb = 'all' | 'head' | 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface IRouter {
  all(path: string, ...middleware: Middleware[]): void;
  head(path: string, ...middleware: Middleware[]): void;
  get(path: string, ...middleware: Middleware[]): void;
  post(path: string, ...middleware: Middleware[]): void;
  put(path: string, ...middleware: Middleware[]): void;
  patch(path: string, ...middleware: Middleware[]): void;
  delete(path: string, ...middleware: Middleware[]): void;

  routes(): Middleware<any, any>;
}

export interface IManagedRoute {
  verb: RouteVerb;
  path: string;
  handlers: Middleware[];
}

export interface IRouteManagerOpts {
  router?: IRouter;
}
