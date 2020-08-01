import {Inject, Injectable} from "@nestjs/common";
import {MYSQL_MAIN_CONN} from "../../providers/db/db.providers";
import {Connection} from "typeorm";
import {UserEntity, UserGroup} from "../../entities/user/user-entity"
import {AuthEntity, AuthTokenType} from "../../entities/auth/auth-entity";
import {Observable} from 'rxjs';
import {getLogger} from "log4js";
import {CryptoService} from "../crypto/crypto-service";

@Injectable()
export class UserService {
    private sessionTimeout: number = 900;
    constructor(
        @Inject(MYSQL_MAIN_CONN) private readonly conn: Connection,
        private readonly cryptoService: CryptoService) {
    }

    createUser(user: UserEntity): Observable<number> {
        return new Observable(s => {
            this.conn.query(
                "INSERT INTO app_users (email, name, password, groups) VALUES (?,?,?,?)",
                [
                    user.email,
                    user.name,
                    this.cryptoService.hashPassword(user.password),
                    user.groups.join(',')
                ]
            ).then(res => {
                s.next(res.insertId);
                s.complete();
            }, function (err) {
                getLogger().error(err);
                s.error();
                s.complete();
            });
        });
    }

    getUserByToken(token: string): Observable<UserEntity> {
        return new Observable<UserEntity>(s => {
            this.conn.query(
                "SELECT u.* FROM app_users u " +
                "INNER JOIN app_users_auth_tokens t ON t.user_id = u.id " +
                "WHERE t.token = ? AND (t.expire_date > ? OR t.type = ?) LIMIT 1",
                [token, +new Date() / 1000, AuthTokenType.PERMANENT]
            ).then(res => {
                    if (!res[0]) {
                        s.error();
                    } else {
                        res[0].password = res[0].password.toString();
                        res[0].groups = <UserGroup[]>res[0].groups.split(',');
                        s.next(<UserEntity>UserEntity.fillFromObject(res[0]));
                    }
                    s.complete();
                },
                err => {
                    getLogger().error(err);
                    s.error();
                    s.complete()
                })
        });
    }

    getUserByEmail(email: string): Observable<UserEntity> {
        return new Observable<UserEntity>(s => {
            this.conn.query(
                "SELECT * FROM app_users u WHERE u.email = ? LIMIT 1", [email]).then(
                res => {
                    if (!res[0]) {
                        s.error();
                    } else {
                        res[0].password = res[0].password.toString();
                        res[0].groups = <UserGroup[]>res[0].groups.split(',');
                        s.next(<UserEntity>UserEntity.fillFromObject(res[0]));
                    }
                    s.complete();
                },
                err => {
                    getLogger().error(err);
                    s.error();
                    s.complete()
                }
            );
        });
    }

    getUserById(id: number): Observable<UserEntity> {
        return new Observable<UserEntity>(s => {
            this.conn.query(
                "SELECT * FROM app_users u WHERE u.id = ? LIMIT 1", [id]).then(
                res => {
                    if (!res[0]) {
                        s.error();
                    } else {
                        res[0].password = res[0].password.toString();
                        res[0].groups = <UserGroup[]>res[0].groups.split(',');
                        s.next(<UserEntity>UserEntity.fillFromObject(res[0]));
                    }
                    s.complete();
                },
                err => {
                    getLogger().error(err);
                    s.error();
                    s.complete()
                }
            );
        });
    }

    authUserById(user_id: number, type: AuthTokenType = AuthTokenType.TEMPORARY): Observable<AuthEntity> {
        const token = this.cryptoService.hashPassword(user_id + type + Math.random() + new Date());
        const create_date = Math.round(+ new Date() / 1000);
        const expire_date = Math.round(+ new Date() / 1000 + this.sessionTimeout);
        return new Observable(s => {
             this.conn.query(
                 "INSERT INTO app_users_auth_tokens (token, user_id, create_date, expire_date, type) " +
                 "VALUES (?,?,FROM_UNIXTIME(?),FROM_UNIXTIME(?),?)", [
                 token,
                 user_id,
                 create_date,
                 expire_date,
                 type
             ]).then(res => {
                 s.next(<AuthEntity>AuthEntity.fillFromObject({
                     token: token,
                     user_id: user_id,
                     create_date: create_date,
                     expire_date: expire_date,
                     type: type
                 }));
                 s.complete();
             }, err => {
                 getLogger().error(err);
                 s.error();
                 s.complete()
             })
        });
    }

    passwordsEqual(hashedPassword: string, clearPassword: string) {
        return hashedPassword === this.cryptoService.hashPassword(clearPassword);
    }
}