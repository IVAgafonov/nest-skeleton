import {Inject, Injectable} from "@nestjs/common";
import {TelegramBotConfig} from "../../entities/configs/telegram-bot-config";
import {TELEGRAM_BOT_MAIN_CONF} from "../../providers/config/config.providers";
import axios from "axios";
import {TelegramService} from "./telegram-service";
import {REDIS_MAIN_CONN} from "../../providers/db/db.providers";
import {RedisClient} from "redis";
import {ControllerLock} from "../../entities/controller-lock/controller-lock";

export const REGISTER_CONTROLLER_LOCKER = 'REGISTER_CONTROLLER_LOCKER';

const LOCKED = 'LOCKED';
const UNLOCKED = 'UNLOCKED';

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
    }

    public preLock(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.set(this.prefix + locker, LOCKED, 'NX', this.config[REGISTER_CONTROLLER_LOCKER].preLockTime || 60, () => resolve(true));
        });
    }

    public lock(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.set(this.prefix + locker, LOCKED, this.config[REGISTER_CONTROLLER_LOCKER].lockTime || 60, () => resolve(true));
        })
    }

    public isLocked(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.get(this.prefix + locker, (err, r) => {
                if (!r || r === UNLOCKED) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public release(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.del(this.prefix + locker, () => resolve(true));
        });
    }

    public ignore(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.redis.set(this.prefix + locker, UNLOCKED, this.config[REGISTER_CONTROLLER_LOCKER].ignoreTime || 60, () => resolve(true));
        });
    }

    public alert(locker: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.telegram.sendMessage(this.config[REGISTER_CONTROLLER_LOCKER].message, {
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
        return Promise.resolve(true);
    }
}