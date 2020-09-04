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
import {TelegramControllerService} from "../../service/telegram/telegram-controller-service";
import { Request } from 'express';

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
    @ApiBearerAuth()
    @UseGuards(RoleGuard)
    @Roles(UserGroup.USER, UserGroup.ADMIN)
    @HttpCode(200)
    @Metric('get_greeting')
    get_greeting(): Promise<MessageResponse> {
        this.telegram.sendMessage('Hello!');
        return Promise.resolve(new MessageResponse('Complete!'));
    }

    @Post('controller_callback')
    @ApiOkResponse({description: 'OK', type: MessageResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Header('Content-type', 'application/json')
    //@ApiBearerAuth()
    //@UseGuards(RoleGuard)
    //@Roles(UserGroup.USER, UserGroup.ADMIN)
    @HttpCode(200)
    @Metric('controller_callback')
    controller_callback(@Req() req: Request): Promise<MessageResponse> {
        //this.s.alert('Test');
        console.log(req.params);
        console.log(req.query);
        return Promise.resolve(new MessageResponse('Processed'));
    }
}