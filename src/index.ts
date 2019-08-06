/* tslint:disable:variable-name */
import RouteManager from './RouteManager';

export const defaultRouteManager = new RouteManager();

export const buildRoutes = defaultRouteManager.buildRoutes.bind(defaultRouteManager);

export const Pre = defaultRouteManager.pre;
export const Route = defaultRouteManager.route;
export const Controller = defaultRouteManager.controller;

export const All = defaultRouteManager.all;
export const Head = defaultRouteManager.head;
export const Get = defaultRouteManager.get;
export const Post = defaultRouteManager.post;
export const Put = defaultRouteManager.put;
export const Patch = defaultRouteManager.patch;
export const Delete = defaultRouteManager.delete;
export const Options = defaultRouteManager.options;

export default RouteManager;
