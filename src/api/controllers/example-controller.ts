import {getLogger} from "log4js";
import prom from "prom-client";
import {Body, Controller, Get, Header, HttpCode, Post, Req, UseGuards, SetMetadata} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from "@nestjs/swagger";
import {UserRegisterRequest} from "../requests/user/user-register-request";
import {UserResponse} from "../responses/user/user-response";
import {BadRequestException} from "../responses/errors/bad-request-exception";
import {RoleGuard} from "../guards/role-guard";
import {CreateUserValidator} from "../validators/user/create-user-validator";
import {UserService} from "../../service/user/user-service";
import {UserEntity, UserGroup} from "../../entities/user/user-entity";
import {UserAuthRequest} from "../requests/user/user-auth-request";
import {InternalErrorException} from "../responses/errors/internal-error-exception";
import {ValidateFieldExceptions} from "../responses/errors/validate-field-exceptions";
import {UserAuthResponse} from "../responses/user/user-auth-response";
import {Observable} from 'rxjs';
import {AuthEntity, AuthTokenType} from "../../entities/auth/auth-entity";
import {AuthUserValidator} from "../validators/user/auth-user-validator";
import {ValidateFieldException} from "../responses/errors/validate-field-exception";
import {AuthorizedRequest} from "../requests/authorized-request";
import {Roles} from "../guards/role-guard";
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";
import {Metric} from "../../service/prometheus/prometheus-service";

@Controller('api/example')
@ApiTags('example')
export class ExampleController {

    log = getLogger(this.constructor.name);

    constructor(@InjectQueue('async_task') private async_task_queue: Queue) {
    }

    @Get('async_task')
    @ApiOkResponse({description: 'OK', type: Object})
    @Header('Content-type', 'application/json')
    @Metric('async_task')
    async_task() {
        for (let i = 0; i <= 100; i++) {
            let rand = Math.random();
            this.log.info(`Add task; id: ${i}; value: ${rand}; pid: ${process.pid}`)
            this.async_task_queue.add({
                id: i,
                value: rand
            });
        }
    }

    @Get('long_task')
    @ApiOkResponse({description: 'OK', type: Object})
    @Header('Content-type', 'application/json')
    @Metric('async_task')
    long_task() {

    }
}