import {CryptoService} from "./crypto-service";
import {CryptoConfig} from "../entities/configs/crypto-config";
import "jasmine";

describe('JsonUtils', () => {

    it('Test hash password', () => {
        const cryptoService = new CryptoService(<CryptoConfig>{salt:"test-salt"})
        const password = "ABCDEFG123";
        expect(cryptoService.hashPassword(password)).toEqual('84f497efaf6050347735739d57d120b4');
    });
});