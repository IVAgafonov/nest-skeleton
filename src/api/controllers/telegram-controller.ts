import {getLogger} from "log4js";
import prom from "prom-client";
import {Body, Controller, Get, Header, HttpCode, Post, Req, UseGuards, SetMetadata, Query} from "@nestjs/common";
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
import {GoogleAutocompleteTaskEntity} from "../../entities/google-autocomplete/google-autocomplete-task-entity";
import {GoogleAutocompleteResponses} from "../responses/google-autocomplete/google-autocomplete-responses";
import {GoogleAutocompleteRequest} from "../requests/google-autocomplete/google-autocomplete-request";
import {GoogleAutocompleteResponse} from "../responses/google-autocomplete/google-autocomplete-response";
import config from "config";
import {MessageResponse} from "../responses/system/message-response";
import {TelegramService} from "../../service/telegram/telegram-service";
import {
    AUTH_CONTROLLER_LOCKER,
    LC_IGNORE,
    LC_LOCKED,
    TelegramControllerService
} from "../../service/telegram/telegram-controller-service";
import axios from "axios";
import os from "os";
import {TelegramCallback} from "../requests/telegram/telegram-callback";

@Controller('api/telegram')
@ApiTags('telegram')
export class TelegramController {

    log = getLogger(this.constructor.name);

    constructor(private telegram: TelegramService, private s: TelegramControllerService) {
    }

    @Get('get_greeting')
    @ApiOkResponse({description: 'OK', type: MessageResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Header('Content-type', 'application/json')
    @HttpCode(200)
    @Metric('get_greeting')
    get_greeting(): Promise<MessageResponse> {
        this.s.alert('Test');
        return Promise.resolve(new MessageResponse('Complete!'));
    }

    @Post('controller_callback')
    @ApiOkResponse({description: 'OK', type: MessageResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Header('Content-type', 'application/json')
    @HttpCode(200)
    @Metric('controller_callback')
    controller_callback(@Body() callback: TelegramCallback): Promise<MessageResponse> {
        console.log(callback);

        this.telegram.deleteMessage(callback.callback_query.message.message_id)

        switch (callback.callback_query.data) {
            case LC_LOCKED:
                this.s.lock(AUTH_CONTROLLER_LOCKER);
                break;
            case LC_IGNORE:
                this.s.ignore(AUTH_CONTROLLER_LOCKER);
                break;
        }

        this.telegram.sendMessage('User: ' + callback.callback_query.from.username + ' ' + callback.callback_query.data + ' auth');

        return Promise.resolve(new MessageResponse('Processed'));
    }

    @Get('get_my_ip')
    @ApiOkResponse({description: 'OK', type: MessageResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Header('Content-type', 'application/json')
    @HttpCode(200)
    @Metric('get_my_ip')
    get_my_ip(): Promise<MessageResponse> {
        return new Promise<MessageResponse>(resolve => {
            console.log(os.networkInterfaces());
            axios.get('https://ifconfig.co/ip').then(r => resolve(new MessageResponse(r.data  + JSON.stringify(os.networkInterfaces()))));
        });
    }
}