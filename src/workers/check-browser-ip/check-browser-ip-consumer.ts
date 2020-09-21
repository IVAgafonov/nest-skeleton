import Bull, {DoneCallback, Job} from 'bull';
import { configure, Log4js } from 'log4js';
import {GoogleAutocompleteTaskEntity} from "../../entities/google-autocomplete/google-autocomplete-task-entity";
//import puppeteer from 'puppeteer'
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {Browser, JSHandle, Page} from "puppeteer";
import Timeout = NodeJS.Timeout;
import {GoogleAutocompleteResponse} from "../../api/responses/google-autocomplete/google-autocomplete-response";
import {exec, execSync} from 'child_process';
const fs = require("fs");
import config from "config";
const logger = configure('./config/log4js.json').getLogger('get-browser-ip-consumer');

let browser: Browser|null = null;

function getBrowser(): Promise<Browser> {
    if (browser && browser.isConnected()) {
        return Promise.resolve(browser);
    } else {
        if (browser) {
            browser = null;
            return Promise.reject(new Error('Browser disconnected'));
        }
    }

    return new Promise<Browser>((resolve, reject) => {
        let browserTimeout = setTimeout(() => {
            if (browser) {
                browser.close().then(() => browser = null).catch(e => browser = null);
            }
            reject(new Error('Browser started too long'));
        }, 15000);

        if (!fs.existsSync('/tmp/chrome-profiles/' + process.pid)) {
            execSync("cp -r /tmp/chrome-profiles/1 /tmp/chrome-profiles/" + process.pid + " || true");
        }

        puppeteer
            .use(StealthPlugin())
            .launch({
                headless: true,
                //executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                //slowMo: 2,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-gpu',
                    '--user-data-dir=/tmp/chrome-profiles/' + process.pid,
                    '--profile-directory=Default',
                    '--netifs-to-ignore=en0'
                ]
            })
            .then(b => {
                browser = b;
                clearTimeout(browserTimeout);
                logger.info("Resolve browser: " + process.pid);
                resolve(browser);
            }).catch(e => {
                clearTimeout(browserTimeout);
                logger.error(e);
                //exec("killall Chromium");
                reject(new Error('Error during starting browser'));
        });
    });
}

export default function (job: Job<any>, done: DoneCallback) {
    logger.info(`Got job: '${job}`);

    getBrowser()
        .then(b => {
            b.newPage()
                .then(page => page.goto('https://ifconfig.co/ip').then(() => page))
                .then(page => page.content().then(c => {
                    logger.debug(`Pid: ${process.pid}; ip: ${c}`);
                    page.close();
                    done(null, c.replace(/<[^>]*>/gi, '').trim());
                }));
        })
        .catch(e => {
            logger.error(e);
            done(null, 'catch error');
            if (browser) {
                browser.close().catch(e => logger.error(e));
            }
        });
}