import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { PORT } from '@config/environment';
import { ExpressServer } from './server';
export class Application {
    public static async createApplication(): Promise<ExpressServer> {
        await DatabaseAdapter.connect();
        await RedisAdapter.connect();

        Application.registerEvents();

        const expressServer = new ExpressServer();
        await expressServer.setup(PORT);
        Application.handleExit(expressServer);

        return expressServer;
    }

    /**
     * Register signal handler to graceful shutdown
     *
     * @param express Express server
     */
    private static handleExit(express: ExpressServer) {
        process.on('uncaughtException', (err: unknown) => {
            logger.error('Uncaught exception', err);
            Application.shutdownProperly(1, express);
        });
        process.on('unhandledRejection', (reason: unknown | null | undefined) => {
            logger.error('Unhandled Rejection at promise', reason);
            Application.shutdownProperly(2, express);
        });
        process.on('SIGINT', () => {
            logger.info('Caught SIGINT, exitting!');
            Application.shutdownProperly(128 + 2, express);
        });
        process.on('SIGTERM', () => {
            logger.info('Caught SIGTERM, exitting');
            Application.shutdownProperly(128 + 2, express);
        });
        process.on('exit', () => {
            logger.info('Exiting process...');
        });
    }

    /**
     * Handle graceful shutdown
     *
     * @param exitCode
     * @param express
     */
    private static shutdownProperly(exitCode: number, express: ExpressServer) {
        Promise.resolve()
            .then(() => express.kill())
            // .then(() => KafkaAdapter.disconnect())
            .then(() => RedisAdapter.disconnect())
            .then(() => DatabaseAdapter.disconnect())
            .then(() => {
                logger.info('Shutdown complete, bye bye!');
                process.exit(exitCode);
            })
            .catch((err) => {
                logger.error('Error during shutdown', err);
                process.exit(1);
            });
    }

    private static registerEvents() {
        // register event
    }
}
