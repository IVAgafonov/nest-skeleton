import { Request } from "express";
import { UserEntity } from "../../entities/user/user-entity";

export interface AuthorizedRequest extends Request {
    user: UserEntity;
}