import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import {InternalErrorException} from "../responses/errors/internal-error-exception";
import {getLogger} from "log4js";

@Catch()
export class GlobalHttpFilter implements ExceptionFilter{
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        if (exception instanceof HttpException) {
            getLogger('HTTP_EXCEPTION').error(exception.constructor.name ? exception.constructor.name : 'Unknown');
            response.status(exception.getStatus()).json(exception);
        } else {
            getLogger('OTHER_EXCEPTION').error(exception);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new InternalErrorException());
        }
    }
}