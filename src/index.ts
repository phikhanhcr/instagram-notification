import { Application } from '@api/application';
import logger from '@common/logger';

/**
 * Entrypoint for bootstrapping and starting the application.
 * Might configure aspects like logging, telemetry, memory leak observation or even orchestration before.
 * This is about to come later!
 */

Application.createApplication().then(() => {
    logger.info('The api was started successfully!');
});
