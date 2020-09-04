import {Inject, Injectable} from "@nestjs/common";
import {TelegramBotConfig} from "../../entities/configs/telegram-bot-config";
import {TELEGRAM_BOT_MAIN_CONF} from "../../providers/config/config.providers";
import axios from "axios";

@Injectable()
export class TelegramService {

    constructor(@Inject(TELEGRAM_BOT_MAIN_CONF) private config: TelegramBotConfig) {
    }

    public sendMessage(message: string, reply_markup: any = null) {
        this.config.recipients.forEach(r => {
            axios.get(
                'https://api.telegram.org/bot' +
                this.config.token +
                '/sendMessage?chat_id=' + r +'&text=' + message +
                (reply_markup ? ('&reply_markup=' + JSON.stringify(reply_markup)) : '')
            ).then(r => {
                console.log(r);
            }).catch(err => {
                console.log(err);
            });
        });

    }
}