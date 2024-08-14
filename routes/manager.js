/**
 * @typedef {Object} Binding
 * @property {string} path - The HTTP path
 * @property {string} controller - The controller path
 */

/**
 * A route manager object that handles binding controllers to a path
 * @module routeManager
 */
class RouteManager {
    constructor() {
        this._protectionMiddleware = (req, res, next) => next();
    }

    /**
     * Set protection middleware
     * @param {Function} fn - The middleware function
     * @returns {RouteManager} - The instance for chaining
     * @throws {TypeError} - If `fn` is not a function
     */
    setProtectionMiddleware(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('Protection middleware must be a function');
        }
        this._protectionMiddleware = fn;
        return this;
    }

    /**
     * Register routes
     * @param {Object} router - An express.Router() object
     * @param {Binding[]} routes - An array of objects with `path` and `controller` properties
     * @returns {Promise<void>}
     */
    async register(router, routes) {

        for (const { path, controller: controllerPath } of routes) {
            try {
                router.use(path, this._protectionMiddleware);

                const controller = require(controllerPath);

                if (typeof controller.connectRoutes === 'function') {
                    await controller.connectRoutes();
                }
                router.use(path, controller.router);

                const controllerName = controllerPath.split('/').pop();
                console.info(`Route ${path} registered with controller ${controllerName}`);
            } catch (error) {
                console.error(`Error registering route ${path}: ${error.message}`);
            }
        }
    }

    /**
     * Register protected routes
     * @param {Object} router - An express.Router() object
     * @param {Binding[]} routes - An array of objects with `path` and `controller` properties
     * @returns {Promise<void>}
     */
    registerProtected(router, routes) {
        return this.register(router, routes);
    }
}

module.exports = new RouteManager();
