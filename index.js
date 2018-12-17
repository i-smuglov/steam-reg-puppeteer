const puppeteer = require('puppeteer');
const Solver = require('rucaptcha-solver/src/solver.js');

const solver = new Solver({
    apiKey: 'YOUR_KEY'
});
const email = 'example@outlook.com';
const emailPass = 'PsswrdExample#987';
const steamAccName = 'NicknnameExample#987'; // Nicknname for steam
const steamAccPass = 'PsswrdExample#987';

// TODO: make all keys as .env variables

// puppeteer start
// TODO: make loop using array of users
(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({width: 768, height: 1024, deviceScaleFactor: 2});
    await page.goto('https://store.steampowered.com/join');
    await page.type('input[name="email"]', email);
    await page.type('input[name="reenter_email"]', email);
    await page.click('#i_agree_check');
    console.log('email');
    const imageSrc = await page.$eval('#captchaImg', el => el.src);
    const {id, answer} = await solver.solve(imageSrc);
    await page.type('input[name="captcha_text"]', answer);
    await page.waitFor(2000);
    await page.click('#createAccountButton');
    console.log('button clicked');
    await page.waitFor(5000);

    // MAIL APPROVAL
    const mail = await browser.newPage();
    await mail.setViewport({width: 1024, height: 768, deviceScaleFactor: 1});
    await mail.goto('https://outlook.com/');
    await mail.waitForSelector('.office-signIn');
    await mail.click('.office-signIn');
    await mail.waitForSelector('input[type="email"]');
    await mail.type('input[type="email"]', email);
    await mail.click('input[type="submit"]');
    await mail.waitForSelector('input[type="password"]');
    await mail.type('input[type="password"]', emailPass);
    await mail.waitFor(1000);
    await mail.click('input[type="submit"]');
    await mail.waitFor(7000);
    await mail.waitForSelector('.ms-Fabric');
    const linkHandlers = await mail.$x("//div[@role = 'option']");
    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
    } else {
        throw new Error("Link not found");
    }
    await mail.waitFor(2000);
    await mail.waitFor('[href^="https://store.steampowered.com/account/newaccountverification"]');
    await mail.click('[href^="https://store.steampowered.com/account/newaccountverification"]');
    await mail.waitFor(3000);

    // PASSWORD AND NICKNAME APPROVAL
    await page.bringToFront();
    await page.waitFor(3000);
    await page.waitFor('#accountname');
    await page.type('#accountname', steamAccName);
    // TODO: generate nickname automatically and pass validation
    await page.type('input[name="password"]', steamAccPass);
    await page.type('input[name="reenter_password"]', steamAccPass);
    await page.waitFor(2000);
    await page.click('#createAccountButton');
})();
