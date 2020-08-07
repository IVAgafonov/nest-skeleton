import {DoneCallback, Job} from 'bull';
import { configure, Log4js } from 'log4js';
import {GoogleAutocompleteTaskEntity} from "../../entities/google-autocomplete/google-autocomplete-task-entity";
//import puppeteer from 'puppeteer'
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import {Browser, JSHandle, Page} from "puppeteer";
import {parseForESLint} from "@typescript-eslint/parser";
import Timeout = NodeJS.Timeout;
import {timeout} from "rxjs/operators";
import {Queue} from "bull";
import {GoogleAutocompleteResponse} from "../../api/responses/google-autocomplete/google-autocomplete-response";
import {exec, execSync} from 'child_process';
const fs = require("fs");

const logger = configure('./config/log4js.json').getLogger('google-autocomplete-consumer');

let browser: Browser|null = null;

let profiles: Array<number> = [1];

function getBrowser(): Promise<Browser> {
    //console.log(browser);
    if (browser && browser.isConnected()) {
        return Promise.resolve(browser);
    }

    return new Promise<Browser>((resolve, reject) => {
        let browserTimeout = setTimeout(() => {
            if (browser) {
                browser.close().then(() => browser = null).catch(e => browser = null);
            }
            reject(new Error('Browser started too long'));
        }, 15000);

        if (!fs.existsSync('/tmp/chrome-profiles/' + process.pid)) {
            execSync("cp -r /tmp/chrome-profiles/1 /tmp/chrome-profiles/" + process.pid);
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
                    '--profile-directory=Default'
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

function getGoogleAutocomplete(b: Browser, keyword: string): Promise<GoogleAutocompleteResponse> {
    let result: string[] = [];
    let timer_search: Timeout;
    let timer_input: Timeout;
    let timer_input_wait: Timeout;
    let timer_click: Timeout;
    let timer_autocomplete: Timeout;

    return new Promise((resolve, reject) => {
        logger.info('Open new page.');
        let current_page: Page|null = null;

        let timeout: Timeout = setTimeout(() => {
            current_page?.close();
            resolve(new GoogleAutocompleteResponse(keyword, []));
        }, 1000);

        b.newPage()
            .then(page => {
                clearTimeout(timeout);
                current_page = page;
                timeout = setTimeout(() => {
                    current_page?.close();
                    resolve(new GoogleAutocompleteResponse(keyword, []));
                }, 1000);
                return page.goto("https://google.ru", {}).then(() => page)
            })
            .then(page => page.waitForSelector("input[name='btnK']").then(() => {
                clearTimeout(timeout);
                timer_search = setTimeout(() => {
                    logger.info("Search button timeout. Close page.");
                    resolve(new GoogleAutocompleteResponse(keyword, []));
                }, 1000);
                return page;
            }))
            .then(page => page.waitForSelector("input[name='q']").then(() => {
                clearTimeout(timer_search);
                timer_input_wait = setTimeout(() => {
                    logger.info("Search input timeout. Close page.");
                    resolve(new GoogleAutocompleteResponse(keyword, []));
                }, 1000);
                return page;
            }))
            .then(page => page.type("input[name='q']", keyword).then(() => {
                clearTimeout(timer_input_wait);
                timer_input = setTimeout(() => {
                    logger.info("Type query timeout. Close page. q: " + keyword + ";");
                    resolve(new GoogleAutocompleteResponse(keyword, []));
                }, 1000);
                return page;
            }))
            .then(page => page.click("input[name='q']").then(() => {
                //logger.info("Search clicked. Set click timeout. Deep: " + deep);
                clearTimeout(timer_input);
                timer_click = setTimeout(() => {
                    logger.info("Click timeout.");
                    resolve(new GoogleAutocompleteResponse(keyword, []));
                }, 1000);
                return page;
            }))
            .then(page => page.waitForSelector(".erkvQe .sbl1 span", {timeout: 5000}).then(() => {
                clearTimeout(timer_click);
                timer_autocomplete = setTimeout(() => {
                    logger.info("Result timeout.");
                    resolve(new GoogleAutocompleteResponse(keyword, []));
                }, 1000);
                return page;
            }))
            .then(page => page.$$('.erkvQe .sbl1 span'))
            .then(elements => Promise.all(elements.map((element => element.getProperty('innerHTML')))))
            .then(innerElements => Promise.all(innerElements.map(innerElement => innerElement.jsonValue())))
            .then(values => {
                clearTimeout(timer_autocomplete);
                values.forEach(value => {
                    let autocomplete = (<string>value).replace(/<[^>]+>/gi, '').replace(/\s+/g, ' ');
                    result.push(autocomplete);
                });
                logger.info("Resolve result.");
                //logger.info(result);
                if (current_page) {
                    current_page.close().catch(e => logger.error(e))
                }
                resolve(new GoogleAutocompleteResponse(keyword, result));
                return Promise.resolve();
            })
            .catch(err => {
                logger.error("Cat't get result.");
                logger.error(err);
                if (current_page) {
                    current_page.close().catch(e => logger.error(e));
                }
                resolve(new GoogleAutocompleteResponse(keyword, []));
            });
    });
}

export default function (job: Job<GoogleAutocompleteTaskEntity>, done: DoneCallback) {
    let response: GoogleAutocompleteResponse[] = [];
    let promises: Promise<any>[] = [];
    logger.info(`Got task; Keywords count: '${job.data.keywords.length}': pid: ${process.pid}`);
    getBrowser().then(b => {
        job.data.keywords.forEach(keyword => {
            promises.push(getGoogleAutocomplete(b, keyword));
        });
        return Promise.all(promises).then(results => {
            results.forEach(result => response = response.concat(result));
            //logger.info(response);
            done(null, response);
        });
    }).catch(e => {
        logger.error(e);
        done(null, response);
        if (browser) {
            browser.close().catch(e => logger.error(e));
        }
    });
}