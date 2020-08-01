import {getLogger} from "log4js";
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
import {Metric, PrometheusService} from "../../service/prometheus/prometheus-service";

@Controller('api/user')
@ApiTags("user")
export class UserController {

    log = getLogger(this.constructor.name);

    constructor(private userService: UserService) {
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


