/* tslint:disable:variable-name */
import RouteManager, { pre } from './RouteManager';

export const defaultRouteManager = new RouteManager();

export const buildRoutes = defaultRouteManager.buildRoutes.bind(defaultRouteManager);

export const Pre = pre;
export const Route = defaultRouteManager.route;
export const Controller = defaultRouteManager.controller;

export const All = defaultRouteManager.all;
export const Get = defaultRouteManager.get;
export const Post = defaultRouteManager.post;
export const Put = defaultRouteManager.put;
export const Patch = defaultRouteManager.patch;
export const Delete = defaultRouteManager.delete;

export default RouteManager;
