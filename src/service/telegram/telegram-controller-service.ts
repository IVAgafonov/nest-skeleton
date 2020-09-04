import {Inject, Injectable} from "@nestjs/common";
import {TelegramBotConfig} from "../../entities/configs/telegram-bot-config";
import {TELEGRAM_BOT_MAIN_CONF} from "../../providers/config/config.providers";
import axios from "axios";
import {TelegramService} from "./telegram-service";
import {REDIS_MAIN_CONN} from "../../providers/db/db.providers";
import {RedisClient} from "redis";
import {ControllerLock} from "../../entities/controller-lock/controller-lock";

export const REGISTER_CONTROLLER_LOCKER = 'REGISTER_CONTROLLER_LOCKER';
export const AUTH_CONTROLLER_LOCKER = 'AUTH_CONTROLLER_LOCKER';

export const LC_NOT_EXISTS = 'LC_NOT_EXISTS';
export const LC_LOCKED = 'LC_LOCKED';
export const LC_UNLOCKED = 'LC_UNLOCKED';

const LOCK = 'LOCK';
const IGNORE = 'IGNORE';

@Injectable()
export class TelegramControllerService {
    private prefix: string = 'TelegramControllerService:';
    private config: any = {};

    constructor(private telegram: TelegramService, @Inject(REDIS_MAIN_CONN) private redis: RedisClient) {
        this.config[REGISTER_CONTROLLER_LOCKER] = {
            preLockTime: 30,
            lockTime: 300,
            ignoreTime: 300,
            message: 'Too many register'
        } as ControllerLock;
        this.config[AUTH_CONTROLLER_LOCKER] = {
            preLockTime: 30,
            lockTime: 300,
            ignoreTime: 300,
            message: 'Too many auths'
        } as ControllerLock;
    }

    public preLock(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.set(this.prefix + locker, LC_LOCKED, 'EX', this.config[locker].preLockTime, () => resolve(true));
        });
    }

    public lock(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.set(this.prefix + locker, LC_LOCKED, 'EX', this.config[locker].lockTime, () => resolve(true));
        })
    }

    public release(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.del(this.prefix + locker, () => resolve(true));
        });
    }

    public ignore(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.set(this.prefix + locker, LC_UNLOCKED, 'EX', this.config[locker].ignoreTime, () => resolve(true));
        });
    }

    public getLock(locker: string): Promise<string> {
        return new Promise<string>(resolve => {
            this.redis.get(this.prefix + locker, (err, r) => {
                resolve(r ? r : LC_NOT_EXISTS);
            });
        });
    }

    public alert(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.telegram.sendMessage(this.config[locker].message, {
                inline_keyboard: [
                    [
                        {
                            text: "Lock",
                            callback_data: LOCK
                        },
                        {
                            text: "Ignore",
                            callback_data: IGNORE
                        }
                    ]
                ]
            });
        });
    }
}