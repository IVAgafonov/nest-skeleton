import { Job } from 'bull';
import { configure, Log4js } from 'log4js';

const logger = configure('./config/log4js.json').getLogger('AsyncTaskConsumerExternal');

export default function (job: Job<unknown>) {
    return new Promise((resolve) => {
        logger.info(`Got task; id: ${job.data} value: ${job.data}; pid: ${process.pid}`);

        setTimeout(() => {
            logger.info(`Completed task; id: ${job.data} value: ${job.data}`);
            resolve();
        }, 2000);
    });
}