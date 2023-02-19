import express, { Express } from 'express';
import { Server } from 'http';
import helmet from 'helmet';
import logger from '@common/logger';
import { NODE_ENV } from '@config/environment';
import routes from '@api/router';
import { ResponseMiddleware } from '@api/response.middleware';

// eslint-disable-next-line @typescript-eslint/ban-types
// express.response.send = function (data: object) {
//     return this.json({ error_code: 0, message: 'OK', ...data });
// };

/**
 * Abstraction around the raw Express.js server and Nodes' HTTP server.
 * Defines HTTP request mappings, basic as well as request-mapping-specific
 * middleware chains for application logic, config and everything else.
 */
export class ExpressServer {
    private server?: Express;
    private httpServer?: Server;

    public async setup(port: number): Promise<Express> {
        const server = express();
        this.setupStandardMiddlewares(server);
        this.setupSecurityMiddlewares(server);
        this.configureRoutes(server);
        this.setupErrorHandlers(server);

        this.httpServer = this.listen(server, port);
        this.server = server;
        return this.server;
    }

    public listen(server: Express, port: number): Server {
        logger.info(`Starting server on port ${port} (${NODE_ENV})`);
        return server.listen(port);
    }

    public async kill(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.httpServer) {
                this.httpServer.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    private setupSecurityMiddlewares(server: Express) {
        server.use(helmet());
        server.use(helmet.referrerPolicy({ policy: 'same-origin' }));
        server.use(
            helmet.contentSecurityPolicy({
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'unsafe-inline'"],
                    scriptSrc: ["'unsafe-inline'", "'self'"],
                },
            }),
        );
    }

    private setupStandardMiddlewares(server: Express) {
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));
    }

    private configureRoutes(server: Express) {
        server.use(routes);
    }

    private setupErrorHandlers(server: Express) {
        // if error is not an instanceOf APIError, convert it.
        server.use(ResponseMiddleware.converter);

        // catch 404 and forward to error handler
        server.use(ResponseMiddleware.notFound);

        // error handler, send stacktrace only during development
        server.use(ResponseMiddleware.handler);
    }
}
