import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { configure, Log4js } from 'log4js';

@Processor('async_task')
export class AsyncTaskConsumer {
    logger = configure('./config/log4js.json')

    @Process({concurrency: 5})
    process_async_task(job: Job<unknown>): Promise<any> {
        return new Promise((resolve) => {
            this.logger.getLogger().info(`Got task; id: ${job.data} value: ${job.data}; pid: ${process.pid}`);

            setTimeout(() => {
                this.logger.getLogger().info(`Completed task; id: ${job.data} value: ${job.data}`);
                resolve();
            }, 2000);
        });
    }
}