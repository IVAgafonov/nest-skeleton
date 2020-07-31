import {Inject, Injectable} from "@nestjs/common";
import crypto from 'crypto';
import {CRYPTO_CONF} from "../../providers/config/config.providers";
import {CryptoConfig} from "../../entities/configs/crypto-config";

@Injectable()
export class CryptoService {
    constructor(@Inject(CRYPTO_CONF) private readonly conf: CryptoConfig) {}
    hashPassword(password: string): string {
        return crypto.createHash('md5').update(this.conf.salt + password).digest('hex');
    }
}