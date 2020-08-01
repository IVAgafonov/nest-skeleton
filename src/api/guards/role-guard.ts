import { Injectable, Inject, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import {UserService} from "../../service/user/user-service";
import {BadRequestException} from "../responses/errors/bad-request-exception";
import {UserEntity, UserGroup} from "../../entities/user/user-entity";
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: UserGroup[]) => SetMetadata('roles', roles);

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly userService: UserService, private readonly reflector: Reflector) {
    }
    canActivate(context: ExecutionContext): Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        let token = request.header('authorization');

        return new Observable<boolean>(s => {
            if (!token) {
                s.next(false);
                s.complete();
            } else {
                token = token.replace(/bearer\s+/i, '');
                this.userService.getUserByToken(token).subscribe((userEntity: UserEntity) => {
                    const roles = this.reflector.get<string[]>('roles', context.getHandler());
                    if (roles.filter(role => userEntity.groups.includes(<UserGroup>role)).length) {
                        request.user = userEntity;
                        s.next(true);
                    } else {
                        s.next(false);
                    }
                    s.complete();
                }, err => {
                    s.next(false);
                    s.complete();
                });
            }
        });
    }
}