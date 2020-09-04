import {getLogger} from "log4js";
import {Body, Controller, Get, Header, HttpCode, Post, Req, UseGuards, SetMetadata, Param, Query} from "@nestjs/common";
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
import {Metric, PrometheusService} from "../../service/prometheus/prometheus-service";
import {MessageResponse} from "../responses/system/message-response";
import {
    AUTH_CONTROLLER_LOCKER,
    LC_LOCKED, LC_NOT_EXISTS, LC_IGNORE,
    TelegramControllerService
} from "../../service/telegram/telegram-controller-service";
import {TooManyRequestsException} from "../responses/errors/too-many-requests-exception";

@Controller('api/user')
@ApiTags("user")
export class UserController {

    log = getLogger(this.constructor.name);

    constructor(private userService: UserService, private telegramControllerService: TelegramControllerService) {
    }

    @ApiOperation({
        summary: "Register new user",
        description: "Register new user"
    })
    @ApiOkResponse({description: "Success", type: UserAuthResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Post('register')
    @Header('Content-Type', 'application/json')
    @HttpCode(200)
    @Metric('register_user')
    register_user(@Body(CreateUserValidator) userRegister: UserRegisterRequest): Observable<UserAuthResponse> {
        const user = new UserEntity();
        user.email = userRegister.email;
        user.name = userRegister.name;
        user.password = userRegister.password;
        user.groups = <UserGroup[]>[UserGroup.USER];
        return new Observable<UserAuthResponse>(s => {
            this.userService.getUserByEmail(user.email).subscribe((existedUser: UserEntity) => {
                    s.error(new BadRequestException("User already exists"));
                    s.complete();
                }, err => {
                this.userService.createUser(user).subscribe((user_id: number) => {
                    this.userService.authUserById(user_id, AuthTokenType.TEMPORARY).subscribe((authEntity: AuthEntity) => {
                        s.next(UserAuthResponse.createFromEntity(authEntity));
                        s.complete();
                    }, err => {
                        this.log.info("User " + userRegister.email + " auth error");
                        s.error(new InternalErrorException("Can't auth user"));
                        s.complete();
                    });
                }, err => {
                    this.log.info("User " + userRegister.email + " create error");
                    s.error(new InternalErrorException("Can't create new user"));
                    s.complete();
                }, () => {
                    this.log.info("User " + userRegister.email + " has successfully registered");
                    PrometheusService.counter('registered_users').inc();
                });
            });
        });
    }

    @ApiOperation({
        summary: "Auth user",
        description: "Auth user"
    })
    @ApiOkResponse({description: "Success", type: UserAuthResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Post('auth')
    @Header('Content-type', 'application/json')
    @HttpCode(200)
    @Metric('auth_user')
    auth_user(@Body(AuthUserValidator) userAuthRequest: UserAuthRequest): Observable<UserAuthResponse> {
        return new Observable<UserAuthResponse>(s => {
            this.telegramControllerService.getLock(AUTH_CONTROLLER_LOCKER).then(lock => {
                console.log(lock);
                if (lock === LC_LOCKED) {
                    s.error(new TooManyRequestsException("Locked"));
                    s.complete();
                    return;
                }
                this.userService.getRecentlyAuthCount().then(count => {
                    console.log('count: ' + count);
                    if (count > 5 && lock === LC_NOT_EXISTS) {
                        this.telegramControllerService.preLock(AUTH_CONTROLLER_LOCKER).then(e => e);
                        this.telegramControllerService.alert(AUTH_CONTROLLER_LOCKER).then(e => e);
                        s.error(new TooManyRequestsException("Got locked"));
                        s.complete();
                        return;
                    } else {
                        this.userService.getUserByEmail(userAuthRequest.email).subscribe((userEntity:UserEntity) => {
                            if (this.userService.passwordsEqual(userEntity.password, userAuthRequest.password)) {
                                this.userService.authUserById(userEntity.id, userAuthRequest.type).subscribe((authEntity: AuthEntity) => {
                                    s.next(UserAuthResponse.createFromEntity(authEntity));
                                    s.complete();
                                }, err => {
                                    this.log.info("User " + userAuthRequest.email + " auth error");
                                    s.error(new InternalErrorException("Can't auth user"));
                                    s.complete();
                                });
                            } else {
                                this.log.info("User " + userAuthRequest.email + " has entered invalid password");
                                s.error(new ValidateFieldExceptions([
                                    new ValidateFieldException('password', 'Invalid password')
                                ]));
                                s.complete();
                            }
                        }, err => {
                            this.log.info("User " + userAuthRequest.email + " does not exist");
                            s.error(new ValidateFieldExceptions([
                                new ValidateFieldException('email', 'User does not exist')
                            ]));
                            s.complete();
                        }, () => {
                            this.log.info("User " + userAuthRequest.email + " has successfully logged in");
                        });
                    }
                });
            })
        });
    }

    @ApiOperation({
        summary: "Logout user",
        description: "Logout user"
    })
    @ApiOkResponse({description: "Success", type: MessageResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Get('logout')
    @Header('Content-type', 'application/json')
    @ApiBearerAuth()
    @UseGuards(RoleGuard)
    @Roles(UserGroup.USER, UserGroup.ADMIN)
    @Metric('logout_user')
    logout_user(@Req() req: AuthorizedRequest): Observable<MessageResponse> {
        return new Observable<MessageResponse>(s => {
            this.userService.logoutUserById(req.user.id, (<string>req.header('Authorization')).replace(/bearer\s+/i, '')).subscribe(e => {
                s.next(new MessageResponse("Logged out"));
                s.complete();
            }, err => {
                s.error(new InternalErrorException());
                s.complete();
            })
        });
    }

    @ApiOperation({
        summary: "Logout user from all devices",
        description: "Logout user from all devices"
    })
    @ApiOkResponse({description: "Success", type: MessageResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Get('logout/all')
    @Header('Content-type', 'application/json')
    @ApiBearerAuth()
    @UseGuards(RoleGuard)
    @Roles(UserGroup.USER, UserGroup.ADMIN)
    @Metric('logout_all_user')
    logout_all_user(@Req() req: AuthorizedRequest): Observable<MessageResponse> {
        return new Observable<MessageResponse>(s => {
            this.userService.logoutUserById(req.user.id).subscribe(e => {
                s.next(new MessageResponse("Logged out"));
                s.complete();
            }, err => {
                s.error(new InternalErrorException());
                s.complete();
            })
        });
    }

    @ApiOperation({
        summary: "Get user",
        description: "Get user info"
    })
    @ApiOkResponse({description: "Success", type: UserResponse})
    @ApiBadRequestResponse({description: "Error", type: BadRequestException})
    @ApiBadRequestResponse({description: "Error", type: ValidateFieldExceptions})
    @ApiInternalServerErrorResponse({description: "Error", type: InternalErrorException})
    @Get('get')
    @Header('Content-type', 'application/json')
    @ApiBearerAuth()
    @UseGuards(RoleGuard)
    @Roles(UserGroup.USER, UserGroup.ADMIN)
    @Metric('get_user')
    get_user(@Req() req: AuthorizedRequest): UserResponse {
        return UserResponse.createFromEntity(<UserEntity>(req.user));
    }
}


